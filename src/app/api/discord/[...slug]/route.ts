/** biome-ignore-all lint/style/noNonNullAssertion: n */

import {
    type APIInteraction,
    type APIInteractionResponse,
    type APIMessageTopLevelComponent,
    Client,
    InteractionResponseType,
    InteractionType,
    MessageFlags,
} from "@buape/carbon";
import { createHandler } from "@buape/carbon/adapters/fetch";
import { createClient } from "@/lib/supabase/server";
import { BotActionSchema, BotActions } from "@/utils/types";

class MessageKitClient extends Client {
    async handleInteractionsRequest(req: Request): Promise<Response> {
        const isValid = await this.validateDiscordRequest(req);
        if (!isValid) return new Response("Unauthorized", { status: 401 });

        const interaction = (await req.json()) as APIInteraction;

        if (interaction.type === InteractionType.Ping) {
            return Response.json({ type: InteractionResponseType.Pong });
        }

        if (interaction.type === InteractionType.MessageComponent) {
            const parsed = BotActionSchema.safeParse(JSON.parse(interaction.data.custom_id));

            if (!parsed.success) {
                const response: APIInteractionResponse = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: { content: "Failed to parse action!" },
                };

                return Response.json(response);
            }

            const params = parsed.data;

            // REPLY TO INTERACTION
            if (params.type === BotActions.ReplyToInteraction) {
                const supabase = await createClient(true);

                const { data: templateData, error: templateDataError } = await supabase
                    .from("templates")
                    .select("*")
                    .filter("template_id", "eq", params.templateId)
                    .single();

                if (templateDataError) {
                    const response: APIInteractionResponse = {
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: JSON.stringify(templateDataError),
                            flags: MessageFlags.Ephemeral,
                        },
                    };

                    return Response.json(response);
                }

                const response: APIInteractionResponse = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        components:
                            templateData.components as unknown as APIMessageTopLevelComponent[],
                        flags:
                            MessageFlags.IsComponentsV2 |
                            (params.ephemeral ? MessageFlags.Ephemeral : 0),
                    },
                };

                return Response.json(response);
            } else if (params.type === BotActions.SendToChannel) {
            }

            const response: APIInteractionResponse = {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: { content: "Something went wrong!" },
            };

            return Response.json(response);
        }

        return new Response("OK", { status: 202 });
    }
}

const client = new MessageKitClient(
    {
        baseUrl: process.env.BASE_URL!,
        deploySecret: process.env.DEPLOY_SECRET!,
        clientId: process.env.DISCORD_CLIENT_ID!,
        publicKey: process.env.DISCORD_PUBLIC_KEY!,
        token: process.env.DISCORD_CLIENT_TOKEN!,
    },
    {},
);

const handler = createHandler(client);
export const GET = (req: Request) => handler(req, {});
export const POST = (req: Request) => handler(req, {});
