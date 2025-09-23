/** biome-ignore-all lint/style/noNonNullAssertion: n */
import {
    type APIInteraction,
    type APIInteractionResponse,
    Client,
    type Context,
    InteractionResponseType,
    InteractionType,
} from "@buape/carbon";
import { createHandler } from "@buape/carbon/adapters/fetch";

class MessageKitClient extends Client {
    async handleInteractionsRequest(req: Request, _: Context): Promise<Response> {
        const isValid = await this.validateDiscordRequest(req);
        if (!isValid) return new Response("Unauthorized", { status: 401 });

        const interaction = (await req.json()) as APIInteraction;

        if (interaction.type === InteractionType.Ping) {
            return Response.json({ type: InteractionResponseType.Pong });
        }

        if (interaction.type === InteractionType.MessageComponent) {
            return new Response(
                JSON.stringify({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: { content: "yes" },
                } as APIInteractionResponse),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
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
