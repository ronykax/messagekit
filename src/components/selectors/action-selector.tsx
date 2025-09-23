import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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
    actions,
    setAction,
}: {
    actions?: Record<string, unknown>[];
    setAction: (action: Record<string, unknown>) => void;
}) {
    const pathname = usePathname();

    const [ownActions, setOwnActions] = useState<Record<string, unknown>[] | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");

    // Fetch actions
    useEffect(() => {
        if (actions !== undefined) return;
        if (!open) return;

        supabase
            .from("actions")
            .select("*")
            .eq("template", pathname.slice(1))
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch actions!");
                } else {
                    setOwnActions(data);
                }
            });
    }, [actions, pathname, open]);

    const currentActions = actions ?? ownActions ?? [];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedValue
                        ? (currentActions.find((action) => action.custom_id === selectedValue)
                              ?.name as string)
                        : "Select action..."}
                    <ChevronsUpDownIcon className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[462px] p-0">
                <Command>
                    <CommandInput placeholder="Search action..." />
                    <CommandList>
                        <CommandEmpty>No action found</CommandEmpty>
                        <CommandGroup>
                            {currentActions.map((item) => (
                                <CommandItem
                                    key={item.custom_id as string}
                                    value={item.name as string}
                                    onSelect={() => {
                                        setSelectedValue(item.custom_id as string);
                                        setAction(item);
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={`${
                                            selectedValue === item.custom_id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {item.name as string}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
