import type { APIGuild } from "discord-api-types/v10";
import {
    EditIcon,
    EllipsisVerticalIcon,
    PickaxeIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getActionTypeLabel } from "@/utils/functions";
import { useUserStore } from "@/utils/stores/user";
import { type BotActionBody, BotActionSchema, BotActions, type RowAction } from "@/utils/types";
import HelperText from "../helper-text";
import RequiredIndicator from "../required-indicator";
import ActionTypeSelector from "../select/action-type";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import ReplyToInteractionFormBody from "./action-data-forms/reply-to-interaction";
import SendToChannelFormBody from "./action-data-forms/send-to-channel";

const supabase = createClient();

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    messageId: string;
    guild: APIGuild;
}

export default function ActionsSheet({ open, setOpen, messageId, guild }: Props) {
    const { user } = useUserStore();

    const [loading, setLoading] = useState(true);

    const [actions, setActions] = useState<RowAction[]>([]);
    const [actionData, setActionData] = useState<BotActionBody | null>(null); // object for building new action data (params)

    const [newActionName, setNewActionName] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const fetchedRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        if (messageId === "new") return;
        if (!open) return;

        if (fetchedRef.current[messageId]) return;
        fetchedRef.current[messageId] = true;

        supabase
            .from("actions")
            .select("*")
            .eq("message_id", messageId)
            .eq("guild_id", guild.id)
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch actions");
                } else {
                    setActions(data);
                }

                setLoading(false);
            });
    }, [messageId, open, guild]);

    const filteredActions = useMemo(() => {
        if (searchValue.trim().length > 0) {
            const searchTerm = searchValue.toLowerCase().trim();
            return actions?.filter((action) => action.name?.toLowerCase().includes(searchTerm));
        }

        return actions;
    }, [searchValue, actions]);

    const newActionConfirmValidity = useMemo(() => {
        return newActionName.trim().length > 0;
    }, [newActionName]);

    useEffect(() => {
        setNewActionName(searchValue);
    }, [searchValue]);

    async function createNewAction() {
        if (!user) return;
        if (messageId === "new") return;

        const parsed = BotActionSchema.safeParse(actionData);

        if (!parsed.success) {
            return toast.error("Invalid schema");
        }

        supabase
            .from("actions")
            .insert({
                name: newActionName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                details: parsed.data,
                message_id: messageId,
                user_id: user.id,
            })
            .select()
            .then(({ data, error }) => {
                if (!actions) return;

                if (error) {
                    toast.error("Failed to create action");
                } else {
                    toast.success("Action has been created");

                    setActions([...actions, ...data]);
                    setActionData(null);
                    setNewActionName("");
                }
            });
    }

    async function deleteAction(id: number) {
        supabase
            .from("actions")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
                if (!actions) return;

                if (error) {
                    toast.error("Failed to delete action");
                } else {
                    setActions(actions.filter((a) => a.id !== id));
                    toast.success("Action has been deleted!");
                }
            });
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="max-w-md">
                <SheetHeader>
                    <SheetTitle>Edit Actions</SheetTitle>
                    <SheetDescription>
                        Create actions to use them to power buttons or select menus in your
                        messages.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <Input
                                className="pe-9"
                                placeholder="Search"
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.currentTarget.value)}
                                disabled={actions === null}
                            />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                                <SearchIcon size={16} aria-hidden="true" />
                            </div>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button disabled={actions === null}>
                                    <PlusIcon />
                                    New Action
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>New Action</DialogTitle>
                                    <DialogDescription>
                                        Create a new action for this message.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-2 mb-2">
                                    <Label>
                                        Name
                                        <RequiredIndicator />
                                    </Label>
                                    <Input
                                        placeholder="Enter action name"
                                        onChange={(e) => setNewActionName(e.currentTarget.value)}
                                        value={newActionName}
                                    />
                                    <HelperText text="Give your action a memorable name" />
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label>
                                            Action <RequiredIndicator />
                                        </Label>
                                        <ActionTypeSelector
                                            actionData={actionData}
                                            setActionData={setActionData}
                                        />
                                        <HelperText text="The type of action you want to trigger" />
                                    </div>

                                    <FormBody
                                        actionData={actionData}
                                        setActionData={setActionData}
                                        guild={guild}
                                    />
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button
                                            disabled={!newActionConfirmValidity}
                                            onClick={createNewAction}
                                        >
                                            Confirm
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="rounded-lg border flex flex-col overflow-hidden">
                        {loading && (
                            <div className="p-2 flex flex-col gap-2">
                                {Array.from({ length: 3 }, (_, i) => 0 + i).map((w) => (
                                    <Skeleton className="h-12 w-full" key={w} />
                                ))}
                            </div>
                        )}
                        {actions?.length === 0 ? (
                            <div className="flex justify-center items-center px-4 py-8 text-muted-foreground text-sm">
                                This message does not have any actions!
                            </div>
                        ) : (
                            filteredActions?.map((action, index) => (
                                <div
                                    className={cn(
                                        "flex p-4 text-sm justify-between hover:bg-accent/30 duration-100",
                                        actions && index !== actions.length - 1 && "border-b",
                                    )}
                                    key={JSON.stringify(action.details)}
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="font-medium">{action.name as string}</span>
                                        <Badge variant={"secondary"}>
                                            <PickaxeIcon />
                                            {getActionTypeLabel(
                                                JSON.parse(JSON.stringify(action.details))
                                                    .type as BotActions,
                                            )}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-7">
                                                <EllipsisVerticalIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem disabled>
                                                <EditIcon />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => deleteAction(action.id)}
                                            >
                                                <TrashIcon />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant={"outline"}>Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function FormBody({
    actionData,
    setActionData,
    guild,
}: {
    actionData: BotActionBody | null;
    setActionData: Dispatch<React.SetStateAction<BotActionBody | null>>;
    guild: APIGuild;
}) {
    if (!actionData) return null;

    switch (actionData.type) {
        case BotActions.SendToChannel:
            return (
                <SendToChannelFormBody data={actionData} setData={setActionData} guild={guild} />
            );
        case BotActions.ReplyToInteraction:
            return <ReplyToInteractionFormBody data={actionData} setData={setActionData} />;
    }
}
