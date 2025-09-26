import type { APIEmoji, APIMessageComponentEmoji } from "discord-api-types/v10";
import { actionOptions } from "./constants";
import type { BotActions } from "./types";

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
