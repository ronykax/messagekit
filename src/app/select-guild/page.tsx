"use client";

import {
    CDNRoutes,
    ImageFormat,
    type RESTAPIPartialCurrentUserGuild,
    RouteBases,
} from "discord-api-types/v10";
import { ArrowRightIcon, ExternalLinkIcon, LoaderIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/utils/stores/user";

const CACHE_KEY = "discord_guilds_cache";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface CachedData {
    guilds: RESTAPIPartialCurrentUserGuild[];
    timestamp: number;
    userId: string;
}

export default function Page() {
    const { user } = useUserStore();
    const [guilds, setGuilds] = useState<RESTAPIPartialCurrentUserGuild[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [redirectingToGuild, setRedirectingToGuild] = useState("");

    useEffect(() => {
        if (!user) return;

        const userId = user.user_metadata.provider_id as string;

        // try to get cached data
        const getCachedGuilds = () => {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (!cached) return null;

                const data: CachedData = JSON.parse(cached);
                const now = Date.now();

                // check if cache is valid (same user, within 12 hours)
                if (data.userId === userId && now - data.timestamp < CACHE_DURATION) {
                    return data.guilds;
                }

                // clear expired cache
                sessionStorage.removeItem(CACHE_KEY);
                return null;
            } catch {
                return null;
            }
        };

        // check cache first
        const cachedGuilds = getCachedGuilds();
        if (cachedGuilds) {
            setGuilds(cachedGuilds);
            setLoading(false);
            return;
        }

        // fetch fresh data if no valid cache
        fetch("api/discord/guilds")
            .then((res) => res.json())
            .then((data) => {
                if (data.guilds) {
                    setGuilds(data.guilds);

                    // Cache the guilds
                    try {
                        const cacheData: CachedData = {
                            guilds: data.guilds,
                            timestamp: Date.now(),
                            userId: userId,
                        };
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                    } catch {
                        // silently fail if sessionStorage is full or unavailable
                    }
                } else {
                    toast.error("Failed to fetch guilds");
                }

                setLoading(false);
            });
    }, [user]);

    return user ? (
        <div className="max-w-md mx-auto p-4 md:py-24 flex flex-col">
            <span className="text-2xl font-semibold font-display">
                Welcome, {(user.user_metadata.name as string).slice(0, -2)}!
            </span>

            <span className="text-muted-foreground mt-3 text-sm">
                Select a server below so Message Kit can access emojis, channels, and other guild
                settings.
            </span>

            {loading ? (
                <div className="mt-6 flex justify-center">
                    <LoaderIcon className="animate-spin size-4" />
                </div>
            ) : (
                <div className="flex flex-col mt-6 rounded-xl border overflow-hidden">
                    {guilds?.map((guild) => {
                        return (
                            <Link
                                key={guild.id}
                                className="hover:bg-secondary p-4 flex gap-4 border-b"
                                href={`/${guild.id}`}
                                onClick={() => setRedirectingToGuild(guild.id)}
                            >
                                <div className="rounded-md bg-primary overflow-hidden size-10">
                                    {guild.icon ? (
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

                    {/* bot invite link */}
                    <Link
                        className="hover:bg-secondary p-4 flex gap-4"
                        href="https://discord.com/oauth2/authorize?client_id=1095138525160149103"
                        target="_blank"
                    >
                        <div className="rounded-md bg-secondary overflow-hidden size-10 border">
                            <div className="size-full text-sm font-medium flex items-center justify-center">
                                <PlusIcon className="size-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-start">
                            <span className="font-display font-medium leading-none">
                                New Server
                            </span>
                            <span className="text-muted-foreground text-sm leading-none">
                                Add Message Kit to your server
                            </span>
                        </div>
                        <div className="my-auto ml-auto">
                            <ExternalLinkIcon className="size-4 mr-2" />
                        </div>
                    </Link>
                </div>
            )}
            {!loading && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                    Added Message Kit to a new server? Click{" "}
                    <a
                        className="underline underline-offset-2 hover:text-white cursor-pointer duration-150"
                        href={`/auth/login?prompt=none&redirect=${encodeURIComponent("/select-guild")}`}
                    >
                        here
                    </a>{" "}
                    to reload.
                </div>
            )}
        </div>
    ) : (
        user === null && (
            <div className="flex justify-center items-center p-4 h-screen">
                <Button variant={"link"} className="text-white" asChild>
                    <a href={`/auth/login?redirect=${encodeURIComponent("/select-guild")}`}>
                        Sign in with Discord
                        <ExternalLinkIcon />
                    </a>
                </Button>
            </div>
        )
    );
}
