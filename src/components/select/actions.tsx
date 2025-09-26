import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import { useDataStore } from "@/lib/stores/data";
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

const _supabase = createClient();

export default function ActionSelector({
    setAction,
    action,
    disabled = false,
}: {
    setAction: (action: RowAction) => void;
    action: string;
    disabled?: boolean;
}) {
    const { actions } = useDataStore();

    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(action);

    const currentActions = actions ?? [];

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

                        const selectedAction = currentActions.find(
                            (action) => JSON.stringify(action.params) === selectedValue,
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
                        <CommandEmpty>
                            {currentActions.length === 0 && "No actions found"}
                        </CommandEmpty>
                        <CommandGroup>
                            {currentActions.map((item) => (
                                <CommandItem
                                    key={`${item.id}`}
                                    onSelect={() => {
                                        setSelectedValue(JSON.stringify(item.params));
                                        setAction(item);
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={`${
                                            selectedValue === JSON.stringify(item.params)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
