import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { DBAction } from "@/utils/types";
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
import { Spinner } from "../ui/spinner";

const supabase = createClient();

export default function ActionSelector({
    actions,
    setAction,
    action,
    disabled = false,
}: {
    actions?: DBAction[] | null;
    setAction: (action: DBAction) => void;
    action: string;
    disabled?: boolean;
}) {
    const pathname = usePathname();

    const [ownActions, setOwnActions] = useState<DBAction[] | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(action);
    const [loading, setLoading] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

    // Sync selectedValue with action prop when it changes
    useEffect(() => {
        setSelectedValue(action);
    }, [action]);

    // Fetch actions immediately when component mounts (if actions prop is not provided)
    useEffect(() => {
        if (disabled) return;

        // If actions are provided as prop, no need to fetch
        if (actions !== undefined) {
            setLoading(false);
            return;
        }

        // If we've already attempted to fetch or already have actions, don't fetch again
        if (hasAttemptedFetch || ownActions !== null) {
            return;
        }

        setLoading(true);
        setHasAttemptedFetch(true);

        supabase
            .from("actions")
            .select("*")
            .eq("template", pathname.slice(1))
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch actions");
                    setLoading(false);
                } else {
                    setOwnActions(data);
                    setLoading(false);
                }
            });
    }, [actions, pathname, ownActions, hasAttemptedFetch, disabled]);

    const currentActions = actions ?? ownActions ?? [];

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
                        if (loading)
                            return <span className="text-muted-foreground">Loading...</span>;
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
                            {loading ? (
                                <Spinner size="medium" />
                            ) : currentActions.length === 0 ? (
                                "No actions found"
                            ) : (
                                "No action found"
                            )}
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
