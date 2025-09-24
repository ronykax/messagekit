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
import { useDataStore } from "@/lib/stores/data";
import type { BotActionBody, BotActions } from "@/utils/types";
import { Checkbox } from "../ui/checkbox";

interface Props {
    data: Extract<BotActionBody, { type: BotActions.ReplyToInteraction }>;
    setData: React.Dispatch<React.SetStateAction<BotActionBody | null>>;
}

export default function ReplyToInteractionFormBody({ data, setData }: Props) {
    const { templates } = useDataStore();

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
                <HelperText text="The message you want to reply with" />
            </div>

            <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:bg-primary/15">
                <Checkbox
                    id="toggle-2"
                    checked={data.ephemeral}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                        setData({ ...data, ephemeral: checked === true })
                    }
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                />
                <div className="grid gap-2 font-normal">
                    <p className="text-sm leading-none font-medium">Temporary Message</p>
                    <p className="text-muted-foreground text-sm">
                        Enable this if you want the message to be visible only to the user who
                        triggers it.
                    </p>
                </div>
            </Label>
        </div>
    );
}
