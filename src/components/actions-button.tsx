import {
    EditIcon,
    EllipsisVerticalIcon,
    PickaxeIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
} from "lucide-react";
import { type Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { actionOptions } from "@/utils/constants";
import { getActionTypeLabel } from "@/utils/functions";
import { type BotActionBody, BotActionSchema, BotActions, type DBAction } from "@/utils/types";
import ReplyToInteractionFormBody from "./forms/reply-to-interaction";
import SendToChannelFormBody from "./forms/send-to-channel";
import HelperText from "./helper-text";
import RequiredIndicator from "./required-indicator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "./ui/sheet";

const supabase = createClient();

export default function ActionsButton({ templateId }: { templateId: string }) {
    const { user } = useUserStore();
    const [sheetOpen, setSheetOpen] = useState(false);

    const [actions, setActions] = useState<DBAction[]>([]);

    // form sates
    const [actionData, setActionData] = useState<BotActionBody | null>(null);
    const [newActionName, setNewActionName] = useState("");

    const fetchedRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        if (templateId === "new") return;
        if (!sheetOpen) return;

        if (fetchedRef.current[templateId]) return;
        fetchedRef.current[templateId] = true;

        supabase
            .from("actions")
            .select("*")
            .filter("template", "eq", templateId)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch actions");
                } else {
                    setActions(data);
                }
            });
    }, [templateId, sheetOpen]);

    async function createNewAction() {
        if (!user) return;
        if (templateId === "new") return;

        const parsed = BotActionSchema.safeParse(actionData);

        if (!parsed.success) {
            return toast.error("Invalid schema");
        }

        supabase
            .from("actions")
            .insert({
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                uid: user.id,
                params: parsed.data,
                template: templateId,
                name: newActionName,
            })
            .select()
            .then(({ data, error }) => {
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
        console.log("trying to delete", id);

        supabase
            .from("actions")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
                if (error) {
                    toast.error("Failed to delete action");
                } else {
                    setActions(actions.filter((a) => a.id !== id));
                    toast.success("Action has been deleted!");
                }
            });
    }

    const newActionConfirmValidity = useMemo(() => {
        return newActionName.trim().length > 0;
    }, [newActionName]);

    return (
        <>
            <Button
                variant="ghost"
                disabled={templateId === "new"}
                onClick={() => setSheetOpen(true)}
            >
                <PickaxeIcon />
                Actions
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                                <Input className="pe-9" placeholder="Search" type="text" />
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                                    <SearchIcon size={16} aria-hidden="true" />
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
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
                                            onChange={(e) =>
                                                setNewActionName(e.currentTarget.value)
                                            }
                                            value={newActionName}
                                        />
                                        <HelperText text="Give your action a memorable name (can be descriptive)" />
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <ActionTypeSelect
                                            actionData={actionData}
                                            setActionData={setActionData}
                                        />
                                        <FormBody
                                            actionData={actionData}
                                            setActionData={setActionData}
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
                            {actions.length === 0 ? (
                                <div className="flex justify-center items-center px-4 py-8 text-muted-foreground text-sm">
                                    This message does not have any actions!
                                </div>
                            ) : (
                                actions.map((action, index) => (
                                    <div
                                        className={cn(
                                            "flex p-4 text-sm justify-between hover:bg-accent/30 duration-100",
                                            index !== actions.length - 1 && "border-b",
                                        )}
                                        key={JSON.stringify(action.params)}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <span className="font-medium">
                                                {action.name as string}
                                            </span>
                                            <Badge variant={"secondary"}>
                                                <PickaxeIcon />
                                                {getActionTypeLabel(
                                                    JSON.parse(JSON.stringify(action.params))
                                                        .type as BotActions,
                                                )}
                                            </Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                >
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
        </>
    );
}

function FormBody({
    actionData,
    setActionData,
}: {
    actionData: BotActionBody | null;
    setActionData: Dispatch<React.SetStateAction<BotActionBody | null>>;
}) {
    if (!actionData) return null;

    switch (actionData.type) {
        case BotActions.SendToChannel:
            return <SendToChannelFormBody data={actionData} setData={setActionData} />;
        case BotActions.ReplyToInteraction:
            return <ReplyToInteractionFormBody data={actionData} setData={setActionData} />;
        default:
            return null;
    }
}

function ActionTypeSelect({
    actionData,
    setActionData,
}: {
    actionData: BotActionBody | null;
    setActionData: React.Dispatch<React.SetStateAction<BotActionBody | null>>;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label>
                Action <RequiredIndicator />
            </Label>
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
            <HelperText text="The type of action you want to trigger" />
        </div>
    );
}
