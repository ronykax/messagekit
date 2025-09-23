import { EllipsisVerticalIcon, PickaxeIcon, SearchIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { type BotAction, BotActions } from "@/utils/types";
import ChannelSelector from "./channel-selector";
import { DataTable } from "./data-table";
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

const actionOptions = [
    { label: "Send to channel", type: BotActions.SendToChannel },
    { label: "Reply to interaction", type: BotActions.ReplyToInteraction },
    { label: "Do nothing", type: BotActions.DoNothing },
];

const supabase = createClient();

export default function ActionsButton({
    templateId,
    templates,
}: {
    templateId: string;
    templates: Record<string, unknown>[] | null;
}) {
    const { user } = useUserStore();
    const [sheetOpen, setSheetOpen] = useState(false);

    const [actions, setActions] = useState<Record<string, unknown>[]>([]);
    const [actionData, setActionData] = useState<BotAction | null>(null);
    const [newActionName, setNewActionName] = useState("");

    useEffect(() => {
        console.log(actionData);
    }, [actionData]);

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

    async function createNewTemplate() {
        if (!user) return;
        if (templateId === "new") return;

        supabase
            .from("actions")
            .insert({
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                custom_id: nanoid(10),
                user: user.id,
                params: actionData,
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
                <SheetContent side="left">
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
                                    cell: () => (
                                        <Button size={"icon"} variant={"ghost"}>
                                            <EllipsisVerticalIcon />
                                        </Button>
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
                                </div>
                                <FormBody
                                    actionData={actionData}
                                    setActionData={(e) => setActionData(e)}
                                    templates={templates}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button
                                            disabled={!newActionConfirmValidity}
                                            onClick={createNewTemplate}
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
    templates,
}: {
    actionData: BotAction | null;
    setActionData: (actionData: BotAction | null) => void;
    templates: Record<string, unknown>[] | null;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Label>
                    Action
                    <RequiredIndicator />
                </Label>
                <Select onValueChange={(e) => setActionData({ type: +e })}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an action type" />
                    </SelectTrigger>
                    <SelectContent>
                        {actionOptions.map((option) => (
                            <SelectItem value={`${option.type}`} key={`${option.type}`}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {actionData && actionData.type === BotActions.SendToChannel && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Label>
                            Message
                            <RequiredIndicator />
                        </Label>
                        <Select
                            onValueChange={(value) =>
                                setActionData({ ...actionData, templateId: value })
                            }
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
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>
                            Channel
                            <RequiredIndicator />
                        </Label>
                        <ChannelSelector onChannelChange={() => {}} />
                    </div>
                </div>
            )}
        </div>
    );
}
