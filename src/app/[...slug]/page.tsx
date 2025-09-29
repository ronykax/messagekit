import { REST } from "@discordjs/rest";
import {
    PermissionFlagsBits,
    type RESTGetAPIGuildMemberResult,
    type RESTGetAPIGuildResult,
    Routes,
} from "discord-api-types/v10";
import { redirect } from "next/navigation";
import Cockpit from "@/components/cockpit";
import { createClient } from "@/lib/supabase/server";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const [guildId, messageId] = (await params).slug;

    if (!guildId) redirect("/");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login?redirect=/select-guild");

    const botToken = process.env.DISCORD_CLIENT_TOKEN;
    if (!botToken) throw new Error("missing DISCORD_CLIENT_TOKEN!");

    const userId: string = user.user_metadata.provider_id;
    if (!userId) redirect("/auth/login?redirect=/select-guild");

    const guild = await verifyUserPermissions(botToken, guildId, userId);

    return <Cockpit messageId={messageId ?? "new"} guild={guild} />;
}

async function verifyUserPermissions(
    botToken: string,
    guildId: string,
    userId: string,
): Promise<RESTGetAPIGuildResult> {
    console.log("verifying...");

    try {
        const rest = new REST({ version: "10" }).setToken(botToken);

        // check: bot is in guild
        const guild = (await rest.get(Routes.guild(guildId), {
            query: new URLSearchParams({ with_counts: "true" }),
        })) as RESTGetAPIGuildResult & { approximate_member_count?: number };

        // owner always has access
        if (guild.owner_id === userId) return guild;

        // check: user is in server
        const member = (await rest.get(
            Routes.guildMember(guildId, userId),
        )) as RESTGetAPIGuildMemberResult;

        // check: user has admin permissions
        const hasAdmin = guild.roles.some((role) => {
            if (!member.roles.includes(role.id)) return false;

            const rolePermissions = BigInt(role.permissions);
            return (rolePermissions & BigInt(PermissionFlagsBits.Administrator)) !== BigInt(0);
        });

        if (!hasAdmin) redirect("/select-guild");

        return guild;
    } catch {
        redirect("/select-guild");
    }
}
