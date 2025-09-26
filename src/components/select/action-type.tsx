import { actionOptions } from "@/utils/constants";
import { type BotActionBody, BotActions } from "@/utils/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function ActionTypeSelector({
    actionData,
    setActionData,
}: {
    actionData: BotActionBody | null;
    setActionData: React.Dispatch<React.SetStateAction<BotActionBody | null>>;
}) {
    return (
        <Select
            value={actionData?.type}
            onValueChange={(val) => {
                const type = val as BotActions;

                if (type === BotActions.SendToChannel) {
                    setActionData({ type, templateId: "", channelId: "" });
                } else if (type === BotActions.ReplyToInteraction) {
                    setActionData({ type, templateId: "", ephemeral: false });
                } else {
                    setActionData({ type });
                }
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an action type" />
            </SelectTrigger>
            <SelectContent>
                {actionOptions.map((option) => (
                    <SelectItem value={option.type} key={option.type}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
