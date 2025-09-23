import type { APIGuildChannel, GuildChannelType } from "discord-api-types/v10";
import { ChannelType } from "discord-api-types/v10";
import {
    Folder,
    Hash,
    Image as ImageIcon,
    Megaphone,
    MessagesSquare,
    Mic2,
    Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGuildStore } from "@/lib/stores/guild";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface Props {
    onChannelChange: (channel: string) => void;
}

export default function ChannelSelector({ onChannelChange }: Props) {
    const [channels, setChannels] = useState<APIGuildChannel<GuildChannelType>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { guild } = useGuildStore();

    useEffect(() => {
        if (!guild) return;
        setIsLoading(true);

        fetch(`/api/discord/guilds/${guild}/channels`)
            .then((res) => res.json())
            .then((data) => {
                setChannels(data);
                setIsLoading(false);
            });
    }, [guild]);

    const renderIcon = (type: ChannelType) => {
        switch (type) {
            case ChannelType.GuildText:
                return <Hash />;
            case ChannelType.GuildVoice:
                return <Volume2 />;
            case ChannelType.GuildCategory:
                return <Folder />;
            case ChannelType.GuildAnnouncement:
                return <Megaphone />;
            case ChannelType.GuildStageVoice:
                return <Mic2 />;
            case ChannelType.GuildForum:
                return <MessagesSquare />;
            case ChannelType.GuildMedia:
                return <ImageIcon />;
            default:
                return <Hash />;
        }
    };

    // build ordered list with top-level channels first, then category groups
    const orderedElements = (() => {
        const hasPosition = (
            c: APIGuildChannel<GuildChannelType>,
        ): c is APIGuildChannel<GuildChannelType> & { position: number } => "position" in c;
        const hasParentId = (
            c: APIGuildChannel<GuildChannelType>,
        ): c is APIGuildChannel<GuildChannelType> & { parent_id: string | null } =>
            "parent_id" in c;

        const positioned = channels.filter(hasPosition);

        const categories = positioned
            .filter((c) => c.type === ChannelType.GuildCategory)
            .sort((a, b) => a.position - b.position);

        const childrenByParent: Record<string, (typeof positioned)[number][]> = {};
        for (const ch of positioned) {
            if (hasParentId(ch) && ch.parent_id) {
                if (!childrenByParent[ch.parent_id]) childrenByParent[ch.parent_id] = [];
                childrenByParent[ch.parent_id].push(ch);
            }
        }
        for (const key of Object.keys(childrenByParent)) {
            childrenByParent[key].sort((a, b) => a.position - b.position);
        }

        const topLevel = positioned
            .filter(
                (c) =>
                    c.type !== ChannelType.GuildCategory &&
                    (!hasParentId(c) || c.parent_id === null),
            )
            .sort((a, b) => a.position - b.position);

        const elements: Array<
            | { kind: "channel"; value: (typeof positioned)[number] }
            | {
                  kind: "category";
                  value: (typeof positioned)[number];
                  children: (typeof positioned)[number][];
              }
        > = [];
        for (const ch of topLevel) {
            elements.push({ kind: "channel", value: ch });
        }
        for (const cat of categories) {
            elements.push({
                kind: "category",
                value: cat,
                children:
                    (childrenByParent as Record<string, (typeof positioned)[number][]>)[cat.id] ??
                    [],
            });
        }
        return elements;
    })();

    return (
        <Select onValueChange={onChannelChange} disabled={isLoading}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading channels..." : "Select a channel"} />
            </SelectTrigger>
            <SelectContent>
                {orderedElements.map((el) => {
                    if (el.kind === "channel") {
                        const ch = el.value;
                        return (
                            <SelectItem key={ch.id} value={ch.id}>
                                {renderIcon(ch.type)}
                                {ch.name}
                            </SelectItem>
                        );
                    }
                    const cat = el.value;
                    const children = el.children;
                    if (!children.length) return null;
                    return (
                        <SelectGroup key={cat.id}>
                            <SelectLabel>{cat.name}</SelectLabel>
                            {children.map((channel) => (
                                <SelectItem key={channel.id} value={channel.id}>
                                    {renderIcon(channel.type)}
                                    {channel.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
