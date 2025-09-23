import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChannelSelector from "@/components/channel-selector";
import HelperText from "@/components/helper-text";
import RequiredIndicator from "@/components/required-indicator";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { BotActionBody, BotActions } from "@/utils/types";

interface Props {
    data: Extract<BotActionBody, { type: BotActions.SendToChannel }>;
    setData: React.Dispatch<React.SetStateAction<BotActionBody | null>>;
}

const supabase = createClient();

export default function SendToChannelFormBody({ data, setData }: Props) {
    const [templates, setTemplates] = useState<Record<string, unknown>[]>();

    useEffect(() => {
        supabase
            .from("templates")
            .select("template_id, name")
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch messages!");
                } else {
                    console.log("fetched messages:", data);
                    setTemplates(data);
                }
            });
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Label>
                    Message <RequiredIndicator />
                </Label>
                <Select
                    onValueChange={(templateId) => setData({ ...data, templateId })}
                    value={data.templateId}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a message" />
                    </SelectTrigger>
                    <SelectContent>
                        {templates?.map((template) => (
                            <SelectItem
                                key={template.template_id as string}
                                value={template.template_id as string}
                            >
                                {template.name as string}
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
                <ChannelSelector onChannelChange={(channelId) => setData({ ...data, channelId })} />
                <HelperText text="The channel you want to send the message to" />
            </div>
        </div>
    );
}
