import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { z } from "zod";
import type { Json } from "./database.types";

export type SendOptions =
    | {
          via: "bot";
          channel_id: string;
      }
    | {
          via: "webhook";
          webhook_url: string;
      };

export enum BotActions {
    SendToChannel = "SendToChannel",
    ReplyToInteraction = "ReplyToInteraction",
    DoNothing = "DoNothing",
}

export const SendToChannelSchema = z.object({
    messageId: z.string(),
    channelId: z.string(),
});

export const ReplyToInteractionSchema = z.object({
    messageId: z.string(),
    ephemeral: z.boolean().default(false),
});

// discriminated union
export const BotActionSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal(BotActions.SendToChannel), ...SendToChannelSchema.shape }),
    z.object({
        type: z.literal(BotActions.ReplyToInteraction),
        ...ReplyToInteractionSchema.shape,
    }),
    z.object({ type: z.literal(BotActions.DoNothing) }),
]);

export type BotActionBody = z.infer<typeof BotActionSchema>;

export type Guild = RESTAPIPartialCurrentUserGuild;

export type RowMessage = {
    items: Json;
    created_at: string;
    name: string | null;
    id: string;
    uid: string;
    updated_at: string;
};

export type RowAction = {
    created_at: string;
    id: number;
    name: string | null;
    params: Json;
    template: string;
    uid: string;
    updated_at: string;
};

export type MarkdownNode =
    | { type: "linebreak" }
    | { type: "heading"; level: number; content: string }
    | { type: "paragraph"; content: string }
    | { type: "small"; content: string }
    | { type: "list"; ordered: boolean; items: string[] };

export type CockpitMode = "new" | "guild-new" | "guild-edit";
