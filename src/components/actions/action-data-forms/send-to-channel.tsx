import type { APIGuild } from "discord-api-types/v10";
import { MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import HelperText from "@/components/helper-text";
import RequiredIndicator from "@/components/required-indicator";
import ChannelSelector from "@/components/select/channels";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { BotActionBody, BotActions, RowMessage } from "@/utils/types";

interface Props {
    data: Extract<BotActionBody, { type: BotActions.SendToChannel }>;
    setData: React.Dispatch<React.SetStateAction<BotActionBody | null>>;
    guild: APIGuild;
}

export default function SendToChannelFormBody({ data, setData, guild }: Props) {
    const [messages, _setMessages] = useState<RowMessage[]>();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Label>
                    Message <RequiredIndicator />
                </Label>
                <Select
                    onValueChange={(messageId) => setData({ ...data, messageId })}
                    value={data.messageId}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a message" />
                    </SelectTrigger>
                    <SelectContent>
                        {messages?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                                <MessageSquareIcon />
                                {template.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <HelperText text="The message you want to send" />
            </div>

            <div className="flex flex-col gap-2">
                <Label>
                    Channel <RequiredIndicator />
                </Label>
                <ChannelSelector
                    onChannelChange={(channelId) => setData({ ...data, channelId })}
                    guild={guild}
                />
                <HelperText text="The channel you want to send the message to" />
            </div>
        </div>
    );
}
