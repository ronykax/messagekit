import { REST } from "@discordjs/rest";
import {
    type APIGuild,
    PermissionFlagsBits,
    type RESTAPIPartialCurrentUserGuild,
    type RESTGetAPICurrentUserGuildsResult,
    RouteBases,
    Routes,
} from "discord-api-types/v10";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const botGuilds = await getBotGuilds();
        if (!botGuilds) {
            return NextResponse.json({
                guilds: null,
                success: false,
                error: "failed to fetch bot guilds!",
            });
        }

        const userGuilds = await getUserGuilds();
        if (!userGuilds) {
            return NextResponse.json({
                guilds: null,
                success: false,
                error: "failed to fetch user guilds!",
            });
        }

        const mutualGuilds = userGuilds.filter((userGuild) =>
            botGuilds.some((botGuild) => botGuild.id === userGuild.id),
        );

        const guilds: RESTAPIPartialCurrentUserGuild[] = [];

        mutualGuilds.forEach((mutualGuild) => {
            const perms = BigInt(mutualGuild.permissions);
            const hasAdmin =
                (perms & BigInt(PermissionFlagsBits.Administrator.toString())) !== BigInt(0);

            if (hasAdmin) guilds.push(mutualGuild);
        });

        return NextResponse.json({ guilds, success: true, error: null });
    } catch (err) {
        console.error("Route error:", err);
        return NextResponse.json({
            guilds: null,
            success: false,
            error: "unexpected error",
        });
    }
}

async function getBotGuilds() {
    const clientToken = process.env.DISCORD_CLIENT_TOKEN;
    if (!clientToken) throw new Error("DISCORD_CLIENT_TOKEN is not set!");

    const rest = new REST({ version: "10" }).setToken(clientToken);

    try {
        const guilds = await rest.get(Routes.userGuilds());
        return guilds as APIGuild[];
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getUserGuilds() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("failed to fetch session!");

    const providerToken = data.session?.provider_token;
    if (!providerToken) throw new Error("failed to get provider token!");

    try {
        const response = await fetch(RouteBases.api + Routes.userGuilds(), {
            method: "GET",
            headers: { Authorization: `Bearer ${providerToken}` },
            cache: "no-store",
        });

        if (!response.ok) throw new Error("response was not ok!");

        const guilds = await response.json();
        return guilds as RESTGetAPICurrentUserGuildsResult;
    } catch (error) {
        console.error(error);
        return null;
    }
}
