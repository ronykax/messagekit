import type { APIEmoji, APIMessageComponentEmoji } from "discord-api-types/v10";
import { actionOptions } from "./constants";
import type { BotActions, MarkdownNode } from "./types";

export function removeAt<T>(array: readonly T[], index: number): T[] {
    const result = array.slice();
    result.splice(index, 1);
    return result;
}

export function updateAt<T>(array: readonly T[], index: number, updater: (oldValue: T) => T): T[] {
    const result = array.slice();
    result[index] = updater(result[index]);
    return result;
}

export function moveItem<T>(array: readonly T[], index: number, direction: "up" | "down"): T[] {
    const result = array.slice();
    if (direction === "up" && index > 0) {
        [result[index - 1], result[index]] = [result[index], result[index - 1]];
    }
    if (direction === "down" && index < result.length - 1) {
        [result[index + 1], result[index]] = [result[index], result[index + 1]];
    }
    return result;
}

export function randomNumber(): number {
    return Math.floor(Math.random() * 1_000_000_000);
}

export function toComponentEmoji(
    emoji: APIEmoji | string | null,
): APIMessageComponentEmoji | undefined {
    if (!emoji) return undefined;

    if (typeof emoji === "string") {
        // unicode emoji
        return { name: emoji };
    }

    // guild emoji
    return {
        id: emoji.id ?? undefined,
        name: emoji.name ?? undefined,
        animated: emoji.animated ?? false,
    };
}

export function hexToNumber(hex: string): number {
    if (hex.startsWith("#")) hex = hex.slice(1);
    return parseInt(hex, 16);
}

export function append<T>(array: readonly T[], item: T): T[] {
    return [...array, item];
}

export const sanitizeFileName = (name: string) => name.trim().replace(/\s+/g, "_");

export function numberToHex(num: number): string {
    return `#${num.toString(16).padStart(6, "0")}`;
}

export function parseDiscordWebhook(urlOrPath: string): { id: string; token: string } | null {
    // try as full URL first
    try {
        const url = new URL(urlOrPath);
        const match = url.pathname.match(/\/api\/webhooks\/(\d+)\/([^/?]+)/);
        if (match) return { id: match[1], token: decodeURIComponent(match[2]) };
    } catch {
        // not a full URL — fall through to path-only parsing
    }

    // path-only or raw "id/token"
    const fallbackMatch = urlOrPath
        .trim()
        .replace(/^\/+|\/+$/g, "")
        .match(/^(?:api\/webhooks\/)?(\d+)\/([^/?]+)/);
    if (fallbackMatch) return { id: fallbackMatch[1], token: decodeURIComponent(fallbackMatch[2]) };

    return null;
}

export const getActionTypeLabel = (type: BotActions) => {
    return actionOptions.find((opt) => opt.type === type)?.label ?? "";
};

export function tokenize(input: string): string[] {
    return input.split(/(\n)/).filter(Boolean);
}

export function parseTokens(tokens: string[]): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];

    const isOrderedItem = (line: string) => {
        // skip leading spaces
        let i = 0;
        while (i < line.length && line[i] === " ") i++;
        const start = i;
        // must have at least one digit
        while (i < line.length && line[i] >= "0" && line[i] <= "9") i++;
        if (i === start) return false;
        // next should be ". "
        return line[i] === "." && line[i + 1] === " ";
    };

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // handle explicit newline tokens (preserve extra linebreaks)
        if (token === "\n") {
            let newlineCount = 0;
            while (tokens[i] === "\n") {
                newlineCount++;
                i++;
            }
            for (let k = 1; k < newlineCount; k++) nodes.push({ type: "linebreak" });
            i--;
            continue;
        }

        // headings + small
        if (token.startsWith("### ")) {
            nodes.push({ type: "heading", level: 3, content: token.slice(4) });
            continue;
        }
        if (token.startsWith("## ")) {
            nodes.push({ type: "heading", level: 2, content: token.slice(3) });
            continue;
        }
        if (token.startsWith("# ")) {
            nodes.push({ type: "heading", level: 1, content: token.slice(2) });
            continue;
        }
        if (token.startsWith("-# ")) {
            nodes.push({ type: "small", content: token.slice(3) });
            continue;
        }

        // helper to collect list items (preserves: skipping "\n" between items)
        function collectList(
            startIndex: number,
            matchFn: (t: string) => boolean,
            extractFn: (t: string) => string | null,
        ) {
            const items: string[] = [];
            let j = startIndex;
            while (j < tokens.length) {
                const t = tokens[j];
                if (t === "\n") {
                    if (items.length === 0) {
                        // leading empty lines before the first item -> skip them
                        j++;
                        continue;
                    }
                    // blank line after we've started collecting items:
                    // stop the list so outer loop can emit linebreak nodes
                    break;
                }
                if (!matchFn(t)) break;
                const item = extractFn(t);
                if (item === null) break;
                items.push(item);
                j++;
            }
            return { items, nextIndex: j };
        }

        // unordered list detection (- or *)
        const tTrim = token.trimStart();
        if (tTrim.startsWith("- ") || tTrim.startsWith("* ")) {
            const { items, nextIndex } = collectList(
                i,
                (t) => {
                    const s = t.trimStart();
                    return s.startsWith("- ") || s.startsWith("* ");
                },
                (t) => t.trimStart().slice(2),
            );

            nodes.push({ type: "list", ordered: false, items });
            i = nextIndex - 1;
            continue;
        }

        // ordered list detection (like "1. item")
        if (isOrderedItem(token)) {
            const extractOrdered = (t: string) => {
                let k = 0;
                // skip leading spaces
                while (k < t.length && t[k] === " ") k++;
                // skip digits
                while (k < t.length && t[k] >= "0" && t[k] <= "9") k++;
                // require ". " after the digits (same as original)
                if (t[k] === "." && t[k + 1] === " ") return t.slice(k + 2);
                return null;
            };

            const { items, nextIndex } = collectList(i, (t) => isOrderedItem(t), extractOrdered);

            nodes.push({ type: "list", ordered: true, items });
            i = nextIndex - 1;
            continue;
        }

        // fallback paragraph
        nodes.push({ type: "paragraph", content: token });
    }

    return nodes;
}
