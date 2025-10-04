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

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // newlines -> always push linebreak
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

        // headings
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

        // small text
        if (token.startsWith("-# ")) {
            nodes.push({ type: "small", content: token.slice(3) });
            continue;
        }

        // unordered list item
        if (token.trimStart().startsWith("- ") || token.trimStart().startsWith("* ")) {
            nodes.push({
                type: "list-item",
                ordered: false,
                content: token.trimStart().slice(2),
            });
            continue;
        }

        // ordered list item (like "1. foo")
        const orderedMatch = token.trimStart().match(/^(\d+)\. (.+)$/);
        if (orderedMatch) {
            nodes.push({
                type: "list-item",
                ordered: true,
                content: orderedMatch[2],
            });
            continue;
        }

        // fallback paragraph
        nodes.push({ type: "paragraph", content: token });
    }

    return nodes;
}

export function groupNodes(nodes: MarkdownNode[]): MarkdownNode[] {
    const result: MarkdownNode[] = [];
    let currentList: { ordered: boolean; items: string[] } | null = null;

    for (const node of nodes) {
        if (node.type === "list-item") {
            // Start a new list if none exists or type mismatches
            if (!currentList || currentList.ordered !== node.ordered) {
                // push previous list
                if (currentList) {
                    result.push({
                        type: "list",
                        ordered: currentList.ordered,
                        items: currentList.items,
                    });
                }
                // start new list
                currentList = { ordered: node.ordered, items: [] };
            }
            currentList.items.push(node.content);
        } else {
            // flush current list before handling other node
            if (currentList) {
                result.push({
                    type: "list",
                    ordered: currentList.ordered,
                    items: currentList.items,
                });
                currentList = null;
            }
            result.push(node);
        }
    }

    // flush trailing list
    if (currentList) {
        result.push({
            type: "list",
            ordered: currentList.ordered,
            items: currentList.items,
        });
    }

    return result;
}
