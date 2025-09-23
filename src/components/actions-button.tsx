import { EditIcon, EllipsisVerticalIcon, PickaxeIcon, SearchIcon, TrashIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { type Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { type BotActionBody, BotActionSchema, BotActions } from "@/utils/types";
import { DataTable } from "./data-table";
import SendToChannelFormBody from "./forms/send-to-channel";
import HelperText from "./helper-text";
import RequiredIndicator from "./required-indicator";
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
import ReplyToInteractionFormBody from "./forms/reply-to-interaction";

const actionOptions = [
    { label: "Send to channel", type: BotActions.SendToChannel },
    { label: "Reply to interaction", type: BotActions.ReplyToInteraction },
    { label: "Do nothing", type: BotActions.DoNothing },
];

const supabase = createClient();

export default function ActionsButton({ templateId }: { templateId: string }) {
    const { user } = useUserStore();
    const [sheetOpen, setSheetOpen] = useState(false);

    const [actions, setActions] = useState<Record<string, unknown>[]>([]);
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
                    toast.error("Failed to fetch actions!");
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
            return toast.error("Failed to parse schema!");
        }

        supabase
            .from("actions")
            .insert({
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                custom_id: nanoid(10),
                uid: user.id,
                params: parsed.data,
                template: templateId,
                name: newActionName,
            })
            .select()
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to create action!");
                } else {
                    toast.success("Action has been created!");
                    setActions([...actions, ...data]);
                }
            });
    }

    async function deleteAction(customId: string) {
        console.log("trying to delete", customId);

        supabase
            .from("actions")
            .delete()
            .eq("custom_id", customId)
            .then(({ error }) => {
                if (error) {
                    toast.error("Failed to delete action!");
                } else {
                    setActions(actions.filter((a) => a.custom_id !== customId));
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
                            Create actions and use them to power buttons or select menus in your
                            messages.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 flex flex-col gap-4">
                        <div className="relative">
                            <Input className="pe-9" placeholder="Search" type="text" />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                                <SearchIcon size={16} aria-hidden="true" />
                            </div>
                        </div>
                        <DataTable
                            columns={[
                                {
                                    accessorKey: "name",
                                    header: () => (
                                        <div className="p-2 text-muted-foreground">Name</div>
                                    ),
                                    cell: ({ row }) => (
                                        <div className="p-2 w-[180px] md:w-[240px] truncate">
                                            {row.original.name as string}
                                        </div>
                                    ),
                                },
                                {
                                    accessorKey: "custom_id",
                                    header: () => null,
                                    cell: ({ row }) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size={"icon"} variant={"ghost"}>
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
                                                    onClick={() =>
                                                        deleteAction(
                                                            row.original.custom_id as string,
                                                        )
                                                    }
                                                >
                                                    <TrashIcon />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ),
                                },
                            ]}
                            data={actions}
                        />
                    </div>
                    <SheetFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>New Action</Button>
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
            return <ReplyToInteractionFormBody data={actionData} setData={setActionData} />
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
