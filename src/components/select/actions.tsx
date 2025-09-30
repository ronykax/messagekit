import type { APIGuild } from "discord-api-types/v10";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { RowAction } from "@/utils/types";
import { Button } from "../ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const supabase = createClient();

export default function ActionSelector({
    setAction,
    action,
    disabled = false,
    messageId,
    guild,
}: {
    setAction: (action: RowAction) => void;
    action: string;
    disabled?: boolean;
    messageId: string;
    guild: APIGuild;
}) {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(action);
    const [actions, setActions] = useState<RowAction[]>([]);

    useEffect(() => {
        if (!open) return;

        supabase
            .from("actions")
            .select("*")
            .eq("message_id", messageId)
            .eq("guild_id", guild.id)
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to get actions");
                } else {
                    setActions(data);
                }
            });
    }, [messageId, open, guild]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {(() => {
                        if (!selectedValue) return "Select action...";

                        const selectedAction = actions.find(
                            (action) => JSON.stringify(action.details) === selectedValue,
                        );

                        return selectedAction?.name || "Select action...";
                    })()}
                    <ChevronsUpDownIcon className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[462px] p-0">
                <Command>
                    <CommandInput placeholder="Search action..." />
                    <CommandList>
                        <CommandEmpty>No actions found</CommandEmpty>
                        <CommandGroup>
                            {actions.map((item) => (
                                <CommandItem
                                    key={`${item.id}`}
                                    onSelect={() => {
                                        setSelectedValue(JSON.stringify(item.details));
                                        setAction(item);
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={`${
                                            selectedValue === JSON.stringify(item.details)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <div className="flex border-t gap-1 p-1">
                            <span className="text-xs ml-2 text-muted-foreground my-auto mr-auto">
                                Page 1
                            </span>
                            <Button className="size-7" size="icon" variant="ghost">
                                <ArrowLeftIcon />
                            </Button>
                            <Button className="size-7" size="icon" variant="ghost">
                                <ArrowRightIcon />
                            </Button>
                        </div>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
