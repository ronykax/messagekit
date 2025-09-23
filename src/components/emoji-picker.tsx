"use client";

import { PopoverClose } from "@radix-ui/react-popover";
import type { APIEmoji } from "discord-api-types/v10";
import { CDNRoutes, ImageFormat, RouteBases } from "discord-api-types/v10";
import { CheckIcon, GlobeIcon, ShieldIcon, SmilePlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Twemoji from "react-twemoji";
import { useGuildStore } from "@/lib/stores/guild";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function EmojiPicker({
    emoji,
    setEmoji,
}: {
    emoji: APIEmoji | string | null;
    setEmoji: (emoji: APIEmoji | string | null) => void;
}) {
    const { guild } = useGuildStore();
    const [emojis, setEmojis] = useState<APIEmoji[] | null>(null);
    const [search, setSearch] = useState("");
    const [defaultEmoji, setDefaultEmoji] = useState("");

    useEffect(() => {
        if (!guild) return;

        fetch(`/api/discord/guilds/${guild}`)
            .then((res) => res.json())
            .then((data) => {
                setEmojis(data.guild.emojis);
            });

        setEmojis([]);
    }, [guild]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="p-2">
                    {emoji &&
                        (typeof emoji === "string" ? (
                            <Twemoji>{emoji}</Twemoji>
                        ) : (
                            emoji.id && (
                                <Image
                                    src={
                                        RouteBases.cdn +
                                        CDNRoutes.emoji(
                                            emoji.id,
                                            emoji.animated ? ImageFormat.GIF : ImageFormat.WebP,
                                        )
                                    }
                                    alt="💔"
                                    width={32}
                                    height={32}
                                />
                            )
                        ))}
                    {emoji === null && <SmilePlusIcon />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                <Tabs defaultValue={typeof emoji === "string" ? "default" : "guild"}>
                    <TabsList className="w-full">
                        <TabsTrigger value="guild">
                            <ShieldIcon />
                            Guild
                        </TabsTrigger>
                        <TabsTrigger value="default">
                            <GlobeIcon />
                            Default
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="default" className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="Enter emoji (e.g. 😩)"
                                className="w-full"
                                onChange={(e) => setDefaultEmoji(e.currentTarget.value)}
                                maxLength={3} // 3 because windows emoji picker is shit
                            />
                        </div>
                        <div className="flex gap-2 w-full">
                            <PopoverClose asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setEmoji(null)}
                                >
                                    <TrashIcon />
                                    Remove
                                </Button>
                            </PopoverClose>
                            <PopoverClose asChild>
                                <Button
                                    className="flex-1"
                                    onClick={() => setEmoji(Array.from(defaultEmoji)[0])}
                                >
                                    <CheckIcon />
                                    Confirm
                                </Button>
                            </PopoverClose>
                        </div>
                    </TabsContent>
                    <TabsContent value="guild" className="flex flex-col gap-2">
                        <Input
                            placeholder="Search for an emoji"
                            className="w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {emojis === null ? (
                            <div className="flex justify-center">
                                <Spinner size="medium" />
                            </div>
                        ) : (
                            <div className="flex flex-wrap">
                                {emojis.length === 0 ? (
                                    <span className="text-sm text-muted-foreground p-4 text-center w-full">
                                        No emojis found
                                    </span>
                                ) : (
                                    emojis
                                        .filter((fetchedEmoji) =>
                                            fetchedEmoji.name
                                                ?.toLowerCase()
                                                .includes(search.toLowerCase()),
                                        )
                                        .map((fetchedEmoji) => {
                                            if (!fetchedEmoji.id) return null;
                                            if (!fetchedEmoji.name) return null;

                                            const url =
                                                RouteBases.cdn +
                                                CDNRoutes.emoji(
                                                    fetchedEmoji.id,
                                                    fetchedEmoji.animated
                                                        ? ImageFormat.GIF
                                                        : ImageFormat.WebP,
                                                );

                                            return (
                                                <PopoverClose asChild key={fetchedEmoji.id}>
                                                    <Button
                                                        variant={
                                                            typeof emoji !== "string" &&
                                                            emoji !== null &&
                                                            fetchedEmoji.id === emoji.id
                                                                ? "secondary"
                                                                : "ghost"
                                                        }
                                                        size="icon"
                                                        onClick={() => {
                                                            if (
                                                                !fetchedEmoji.id ||
                                                                !fetchedEmoji.name
                                                            )
                                                                return;

                                                            if (
                                                                typeof emoji !== "string" &&
                                                                emoji !== null
                                                            ) {
                                                                if (fetchedEmoji.id === emoji.id) {
                                                                    setEmoji(null);
                                                                    return;
                                                                }
                                                            }

                                                            setEmoji({
                                                                animated: fetchedEmoji.animated,
                                                                id: fetchedEmoji.id,
                                                                name: fetchedEmoji.name,
                                                            });
                                                        }}
                                                        title={fetchedEmoji.name}
                                                        className="overflow-hidden"
                                                    >
                                                        <Image
                                                            className="size-[18px]"
                                                            src={url}
                                                            alt={fetchedEmoji.name}
                                                            width={32}
                                                            height={32}
                                                        />
                                                    </Button>
                                                </PopoverClose>
                                            );
                                        })
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
