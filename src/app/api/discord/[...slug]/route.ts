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

const supabase = createClient({ useServiceRole: true });

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
                const { data: message, error: messageError } = await (await supabase)
                    .from("messages")
                    .select("items")
                    .eq("id", params.messageId)
                    .single();

                if (messageError) {
                    const response: APIInteractionResponse = {
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: "Failed to get message!",
                            flags: MessageFlags.Ephemeral,
                        },
                    };

                    return Response.json(response);
                }

                const response: APIInteractionResponse = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        components: message.items as unknown as APIMessageTopLevelComponent[],
                        flags:
                            MessageFlags.IsComponentsV2 |
                            (params.ephemeral ? MessageFlags.Ephemeral : 0),
                    },
                };

                return Response.json(response);
            } else if (params.type === BotActions.SendToChannel) {
            } else if (params.type === BotActions.DoNothing) {
                const response: APIInteractionResponse = {
                    type: InteractionResponseType.Pong,
                };

                return Response.json(response);
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

function getEnv(name: string) {
    const result = process.env[name];

    if (!result) {
        throw new Error(`missing ${result}`);
    }

    return result;
}

const client = new MessageKitClient(
    {
        baseUrl: getEnv("BASE_URL"),
        deploySecret: getEnv("DEPLOY_SECRET"),
        clientId: getEnv("DISCORD_CLIENT_ID"),
        publicKey: getEnv("DISCORD_PUBLIC_KEY"),
        token: getEnv("DISCORD_CLIENT_TOKEN"),
    },
    {},
);

const handler = createHandler(client);

export const GET = (req: Request) => handler(req, {});
export const POST = (req: Request) => handler(req, {});
