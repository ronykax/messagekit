/** biome-ignore-all lint/style/noNonNullAssertion: n */

import {
    type APIInteraction,
    type APIInteractionResponse,
    Client,
    InteractionResponseType,
    InteractionType,
} from "@buape/carbon";
import { createHandler } from "@buape/carbon/adapters/fetch";
import { createClient } from "@/lib/supabase/server";

class MessageKitClient extends Client {
    async handleInteractionsRequest(req: Request): Promise<Response> {
        const isValid = await this.validateDiscordRequest(req);
        if (!isValid) return new Response("Unauthorized", { status: 401 });

        const interaction = (await req.json()) as APIInteraction;

        if (interaction.type === InteractionType.Ping) {
            return Response.json({ type: InteractionResponseType.Pong });
        }

        if (interaction.type === InteractionType.MessageComponent) {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("actions")
                .select("*")
                .filter("custom_id", "eq", interaction.data.custom_id)
                .single();

            const content = error
                ? "Failed to fetch action!"
                : `\`\`\`${JSON.stringify(data)}\`\`\``;

            const response: APIInteractionResponse = {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: { content },
            };

            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
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
