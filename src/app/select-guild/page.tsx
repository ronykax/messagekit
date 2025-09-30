"use client";

import {
    CDNRoutes,
    ImageFormat,
    type RESTAPIPartialCurrentUserGuild,
    RouteBases,
} from "discord-api-types/v10";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/utils/stores/user";

export default function Page() {
    const { user } = useUserStore();
    const [guilds, setGuilds] = useState<RESTAPIPartialCurrentUserGuild[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirectingToGuild, setRedirectingToGuild] = useState("");

    useEffect(() => {
        fetch("api/discord/guilds")
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = `/auth/login?prompt=none&redirect=${encodeURIComponent("/select-guild")}`;
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return; // Redirecting

                if (data.guilds) {
                    setGuilds(data.guilds);
                } else {
                    toast.error("Failed to fetch guilds");
                }

                setLoading(false);
            });
    }, []);

    return user ? (
        <div className="max-w-xl mx-auto p-4 md:py-24 flex flex-col">
            <span className="text-4xl font-semibold font-display">
                Welcome, {(user.user_metadata.name as string).slice(0, -2)}!
            </span>

            <span className="text-muted-foreground mt-4">
                Select a server below to continue. This is so Message Kit can access emojis,
                channels, and other guild settings.
            </span>

            {loading ? (
                <div className="mt-12 flex justify-center">
                    <LoaderIcon className="animate-spin size-4" />
                </div>
            ) : (
                <div className="flex flex-col mt-6 rounded-md border overflow-hidden">
                    {guilds.length === 0 && (
                        <div className="text-sm flex justify-center text-muted-foreground items-center px-4 py-8">
                            No guilds found!
                        </div>
                    )}
                    {guilds.map((guild, index) => {
                        return (
                            <Link
                                key={guild.id}
                                className={cn(
                                    "hover:bg-secondary p-4 flex gap-4",
                                    index !== guilds.length - 1 && "border-b",
                                )}
                                href={`/${guild.id}`}
                                onClick={() => setRedirectingToGuild(guild.id)}
                            >
                                <div className="rounded-md bg-primary overflow-hidden size-10">
                                    {guild.icon ? (
                                        // biome-ignore lint/performance/noImgElement: no
                                        <img
                                            src={
                                                RouteBases.cdn +
                                                CDNRoutes.guildIcon(
                                                    guild.id,
                                                    guild.icon,
                                                    ImageFormat.WebP,
                                                )
                                            }
                                            alt={guild.name}
                                        />
                                    ) : (
                                        <div className="size-full text-sm font-medium flex items-center justify-center">
                                            {guild.name
                                                .trim()
                                                .split(/\s+/)
                                                .slice(0, 2)
                                                .map((w) => w[0].toUpperCase())
                                                .join("")}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-start">
                                    <span className="font-display font-medium leading-none">
                                        {guild.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm leading-none">
                                        {guild.name}
                                    </span>
                                </div>
                                <div className="my-auto ml-auto">
                                    {redirectingToGuild === guild.id ? (
                                        <LoaderIcon className="size-4 mr-2 animate-spin" />
                                    ) : (
                                        <ArrowRightIcon className="size-4 mr-2" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    ) : (
        <div className="flex justify-center items-center p-4 h-screen text-sm text-muted-foreground">
            You're not logged in!
        </div>
    );
}
