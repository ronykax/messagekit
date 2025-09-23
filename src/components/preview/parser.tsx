import React, { useMemo } from "react";

// ---------------------------
// Regex constants
// ---------------------------
const FENCE_RE = /^```(?:\s*(\w+))?\s*$/;
const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const LIST_ITEM_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
const ORDERED_ITEM_MARKER_RE = /^\d+\.$/;
const SUPER_SMALL_RE = /^-#\s+(.*)$/;
const EMPTY_LINE_RE = /^\s*$/;

// Inline (captures expected in group 1 for convenience)
const INLINE_CODE_RE = /`([^`]+?)`/;
const BOLD_RE = /\*\*(.+?)\*\*/;
const UNDERLINE_RE = /__(.+?)__/;
const STRIKE_RE = /~~(.+?)~~/;
const ITALIC_ASTERISK_RE = /\*([^*\n]+?)\*/;
const ITALIC_UNDERSCORE_RE = /_([^_\n]+?)_/;
const MENTION_RE = /<@(\d+)>/;

// ---------------------------
// Types
// ---------------------------
type ReactNodeish = React.ReactNode;

type InlineRule = {
    name: string;
    pattern: RegExp;
    render: (match: RegExpExecArray, recurse: (text: string) => ReactNodeish[]) => ReactNodeish;
};

type Token =
    | { type: "heading"; level: number; content: string }
    | { type: "paragraph"; content: string }
    | { type: "codeblock"; lang?: string; content: string }
    | { type: "list"; ordered: boolean; items: ListItem[] }
    | { type: "super_small"; content: string };

type ListItem = { content: string; children?: ListItem[] };

export type MarkdownRendererProps = {
    content: string;
    // extra inline rules to append (rules run before defaults if placed earlier in array)
    extraInlineRules?: InlineRule[];
    // map of element -> tailwind className (no defaults applied)
    classMap?: Partial<Record<string, string>>;
    // custom components for special tokens
    components?: {
        Mention?: React.ComponentType<{ id: string }>;
    };
};

// ---------------------------
// Default inline rules (no styles here)
// ---------------------------
const DEFAULT_INLINE_RULES: InlineRule[] = [
    { name: "inline_code", pattern: INLINE_CODE_RE, render: (m) => <code>{m[1]}</code> },
    { name: "bold", pattern: BOLD_RE, render: (m, r) => <strong>{r(m[1])}</strong> },
    { name: "underline", pattern: UNDERLINE_RE, render: (m, r) => <u>{r(m[1])}</u> },
    { name: "strike", pattern: STRIKE_RE, render: (m, r) => <s>{r(m[1])}</s> },
    { name: "italic_ast", pattern: ITALIC_ASTERISK_RE, render: (m, r) => <em>{r(m[1])}</em> },
    {
        name: "italic_underscore",
        pattern: ITALIC_UNDERSCORE_RE,
        render: (m, r) => <em>{r(m[1])}</em>,
    },
    {
        name: "mention",
        pattern: MENTION_RE,
        render: (m) => <span data-mention-id={m[1]}>@{m[1]}</span>,
    },
];

// ---------------------------
// Simple block tokenizer
// ---------------------------
function tokenizeBlocks(md: string): Token[] {
    const lines = md.split(/\r?\n/);
    const tokens: Token[] = [];

    let i = 0;
    let inFence = false;
    let fenceLang: string | undefined;
    const fenceBuf: string[] = [];
    const paraBuf: string[] = [];

    function flushPara() {
        if (paraBuf.length) {
            tokens.push({ type: "paragraph", content: paraBuf.join(" ") });
            paraBuf.length = 0;
        }
    }

    while (i < lines.length) {
        const line = lines[i];

        const f = line.match(FENCE_RE);
        if (f) {
            if (!inFence) {
                inFence = true;
                fenceLang = f[1];
                fenceBuf.length = 0;
                flushPara();
            } else {
                inFence = false;
                tokens.push({ type: "codeblock", lang: fenceLang, content: fenceBuf.join("\n") });
                fenceLang = undefined;
            }
            i++;
            continue;
        }

        if (inFence) {
            fenceBuf.push(line);
            i++;
            continue;
        }

        if (EMPTY_LINE_RE.test(line)) {
            flushPara();
            i++;
            continue;
        }

        const h = line.match(HEADING_RE);
        if (h) {
            flushPara();
            tokens.push({ type: "heading", level: Math.min(3, h[1].length), content: h[2] });
            i++;
            continue;
        }

        const sm = line.match(SUPER_SMALL_RE);
        if (sm) {
            flushPara();
            tokens.push({ type: "super_small", content: sm[1] });
            i++;
            continue;
        }

        // collect consecutive list lines
        const listLines: { indent: number; marker: string; text: string }[] = [];
        let look = i;
        while (look < lines.length) {
            const lm = lines[look].match(LIST_ITEM_RE);
            if (!lm) break;
            const indent = lm[1].replace(/\t/g, "  ").length;
            listLines.push({ indent, marker: lm[2], text: lm[3] });
            look++;
        }

        if (listLines.length) {
            flushPara();
            // build simple nested list by indent (2 spaces per level)
            function build(
                items: typeof listLines,
                start = 0,
                baseIndent = items[0]?.indent ?? 0,
            ): { nodes: ListItem[]; end: number } {
                const nodes: ListItem[] = [];
                let idx = start;
                while (idx < items.length) {
                    const it = items[idx];
                    const level = Math.floor((it.indent - baseIndent) / 2);
                    if (level < 0) break;
                    // find children: next lines with greater indent
                    let j = idx + 1;
                    const childrenLines: typeof listLines = [];
                    while (j < items.length && items[j].indent > it.indent) {
                        childrenLines.push(items[j]);
                        j++;
                    }
                    const child = childrenLines.length
                        ? build(childrenLines, 0, childrenLines[0].indent)
                        : { nodes: [], end: 0 };
                    nodes.push({
                        content: it.text,
                        children: child.nodes.length ? child.nodes : undefined,
                    });
                    idx = j;
                }
                return { nodes, end: idx };
            }
            const tree = build(listLines);
            const ordered = ORDERED_ITEM_MARKER_RE.test(listLines[0].marker);
            tokens.push({ type: "list", ordered, items: tree.nodes });
            i = look;
            continue;
        }

        // otherwise paragraph line
        paraBuf.push(line.trim());
        i++;
    }

    flushPara();
    return tokens;
}

// ---------------------------
// Inline renderer (simple, ordered rules)
// ---------------------------
function makeInlineRenderer(rules: InlineRule[]) {
    return function renderInline(text: string): ReactNodeish[] {
        const out: ReactNodeish[] = [];
        let remaining = text;

        while (remaining.length) {
            let earliest: { rule: InlineRule; match: RegExpExecArray; index: number } | null = null;
            for (const r of rules) {
                try {
                    (r.pattern as RegExp).lastIndex = 0;
                } catch {}
                const m = r.pattern.exec(remaining);
                if (m && (earliest === null || m.index < earliest.index))
                    earliest = { rule: r, match: m, index: m.index };
            }

            if (!earliest) {
                out.push(remaining);
                break;
            }

            const { rule, match, index } = earliest;
            if (index > 0) out.push(remaining.slice(0, index));
            // rule.render gets the match and a recurse fn for inner content
            const node = rule.render(match, (t) => makeInlineRenderer(rules)(t));
            out.push(node);
            remaining = remaining.slice(index + match[0].length);
        }

        return out;
    };
}

// ---------------------------
// Component
// ---------------------------
export default function MarkdownRenderer({
    content,
    extraInlineRules,
    classMap,
    components,
}: MarkdownRendererProps) {
    const inlineRules = useMemo(() => {
        // custom mention rule uses provided Mention component if present
        const mentionRule: InlineRule = components?.Mention
            ? {
                  name: "mention",
                  pattern: MENTION_RE,
                  render: (m) =>
                      components.Mention ? (
                          React.createElement(components.Mention, { id: m[1] })
                      ) : (
                          <span data-mention-id={m[1]}>@{m[1]}</span>
                      ),
              }
            : {
                  name: "mention",
                  pattern: MENTION_RE,
                  render: (m) => <span data-mention-id={m[1]}>@{m[1]}</span>,
              };

        // final rules: extras first so user can override defaults
        return [
            ...(extraInlineRules ?? []),
            mentionRule,
            ...DEFAULT_INLINE_RULES.filter((r) => r.name !== "mention"),
        ];
    }, [extraInlineRules, components]);

    const renderInline = useMemo(() => makeInlineRenderer(inlineRules), [inlineRules]);
    const tokens = useMemo(() => tokenizeBlocks(content || ""), [content]);

    function renderList(items: ListItem[], key = "") {
        return items.map((it, i) => {
            const itemKey = key + (it.content ? it.content.slice(0, 16) : i);
            return (
                <li key={itemKey} className={classMap?.li}>
                    {renderInline(it.content)}
                    {it.children ? (
                        <ul className={classMap?.ul}>{renderList(it.children, `${itemKey}-`)}</ul>
                    ) : null}
                </li>
            );
        });
    }

    return (
        <div>
            {tokens.map((t: Token, i: number) => {
                let key = t.type;
                if ("content" in t && typeof t.content === "string") {
                    key += `-${t.content.slice(0, 16)}`;
                } else {
                    key += `-${i}`;
                }
                switch (t.type) {
                    case "heading": {
                        const tagName = `h${Math.min(3, t.level)}`;
                        return React.createElement(
                            tagName,
                            { key, className: classMap?.[tagName] || undefined },
                            renderInline(t.content),
                        );
                    }
                    case "paragraph":
                        return (
                            <p key={key} className={classMap?.p}>
                                {renderInline(t.content)}
                            </p>
                        );
                    case "codeblock":
                        return (
                            <pre key={key} className={classMap?.pre}>
                                <code className={classMap?.code}>{t.content}</code>
                            </pre>
                        );
                    case "list":
                        return t.ordered ? (
                            <ol key={key} className={classMap?.ol}>
                                {renderList(t.items, `${String(i)}-`)}
                            </ol>
                        ) : (
                            <ul key={key} className={classMap?.ul}>
                                {renderList(t.items, `${String(i)}-`)}
                            </ul>
                        );
                    case "super_small":
                        return (
                            <small key={key} className={classMap?.small}>
                                {renderInline(t.content)}
                            </small>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

// ---------------------------
// Short examples (do not include styles here):
//
// <MarkdownRenderer
//   content={md}
//   classMap={{ h1: 'text-2xl font-bold', p: 'my-2', code: 'px-1 bg-gray-100 rounded' }}
//   components={{ Mention: (props) => <span className="text-indigo-600">@{props.id}</span> }}
//   extraInlineRules={[ { name: 'emoji', pattern: /:(smile):/, render: () => '😄' } ]}
///>
// ---------------------------
