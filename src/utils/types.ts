import { z } from "zod";

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
    SendToChannel,
    ReplyToInteraction,
    DoNothing,
}

export const SendToChannelSchema = z.object({
    templateId: z.string(),
    channelId: z.string(),
});

export const ReplyToInteractionSchema = z.object({
    templateId: z.string(),
    ephemeral: z.boolean().default(false),
});

// discriminated union
export const ActionSchema = z.discriminatedUnion("type", [
    z.object({ type: BotActions.SendToChannel, ...SendToChannelSchema.shape }),
    z.object({ type: BotActions.ReplyToInteraction, ...ReplyToInteractionSchema.shape }),
    z.object({ type: BotActions.DoNothing }),
]);

export type BotAction = z.infer<typeof ActionSchema>;
