import { type DiscordAPIError, type RawFile, REST } from "@discordjs/rest";
import { type RESTPostAPIChannelMessageJSONBody, Routes } from "discord-api-types/v10";
import { type NextRequest, NextResponse } from "next/server";
import { parseDiscordWebhook, sanitizeFileName } from "@/utils/functions";
import type { SendOptions } from "@/utils/types";

const botToken = process.env.DISCORD_CLIENT_TOKEN;

if (!botToken) {
    throw new Error("DISCORD_CLIENT_TOKEN is not set");
}

const rest = new REST({ version: "10" }).setToken(botToken);

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const files = formData.getAll("images") as File[];
    const messagePayload = formData.get("message") as string;
    const optionsPayload = formData.get("options") as string;

    const message = JSON.parse(messagePayload) as RESTPostAPIChannelMessageJSONBody;
    const options = JSON.parse(optionsPayload) as SendOptions;

    // prepare files for discord rest (multipart)
    const rawFiles: RawFile[] = await Promise.all(
        files.map(async (file) => ({
            name: sanitizeFileName(file.name),
            data: Buffer.from(await file.arrayBuffer()),
            contentType: file.type || undefined,
        })),
    );

    if (options.via === "webhook") {
        const webhook = parseDiscordWebhook(options.webhook_url);
        if (!webhook) return NextResponse.json({ success: false });
        // return NextResponse.json({ success: false, error: { code: 500027, message: "Invalid Webhook Token" } });

        try {
            await rest.post(Routes.webhook(webhook.id, webhook.token), {
                body: message,
                files: rawFiles.length > 0 ? rawFiles : undefined,
                query: new URLSearchParams({ with_components: "true" }),
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: (error as DiscordAPIError).rawError,
            });
        }
    } else if (options.via === "bot") {
        try {
            // console.log("message data:", JSON.stringify(message));
            await rest.post(Routes.channelMessages(options.channel_id), {
                body: message,
                files: rawFiles.length > 0 ? rawFiles : undefined,
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: (error as DiscordAPIError).rawError,
            });
        }
    }

    return NextResponse.json({ success: false });
}
