import type { APIMessageTopLevelComponent } from "discord-api-types/v10";
import {
    ChevronRightIcon,
    EraserIcon,
    HouseIcon,
    LogInIcon,
    MessageSquareIcon,
    PlusIcon,
    RedoIcon,
    RefreshCwIcon,
    UndoIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDataStore } from "@/lib/stores/data";
import { useGuildStore } from "@/lib/stores/guild";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { componentDescriptors, defaultComponents } from "@/utils/constants";
import type { Json } from "@/utils/database.types";
import { append } from "@/utils/functions";
import ActionsButton from "../actions/button";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const supabase = createClient();

export default function EditorNavbar({
    setComponents,
    components,
}: {
    setComponents: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    components: APIMessageTopLevelComponent[];
}) {
    const { user } = useUserStore();

    const router = useRouter();

    const { message: param } = useParams();
    const templateId = `${param}`;

    const { guild, setGuild } = useGuildStore();

    const {
        fetched,
        setFetched,

        // templates
        templates,
        setTemplates,

        // guilds
        guilds,
        setGuilds,
    } = useDataStore();

    // NEW TEMPLATE
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const addComponent = <T extends APIMessageTopLevelComponent>(component: T) =>
        setComponents((previousComponents) => append(previousComponents, component));

    const componentsList = componentDescriptors.map((descriptor) => ({
        name: descriptor.name,
        type: descriptor.type,
        icon: descriptor.icon,
        onClick: () => addComponent(descriptor.create() as APIMessageTopLevelComponent),
        disabled: descriptor.disabled,
    }));

    useEffect(() => {
        if (!user) return;
        if (fetched) return;

        supabase
            .from("templates")
            .select("*")
            .eq("uid", user.id)
            .limit(25)
            .then(({ data, error }) => {
                if (error) toast.error("Failed to load messages");
                setTemplates(data);
            });

        fetch("/api/discord/guilds")
            .then((res) => res.json())
            .then((data) => setGuilds(data.guilds));

        setFetched(true);
    }, [user, fetched, setTemplates, setGuilds, setFetched]);

    // clear stored guild when guilds become empty
    useEffect(() => {
        if (guilds === null) return;

        // if guilds loaded but empty -> clear stored guild
        if (guilds.length === 0) {
            setGuild(null);
            return;
        }

        // if guild exists in storage but not in the fetched list -> clear it
        if (guild && !guilds.some((g) => g.id === guild)) {
            setGuild(null);
        }
    }, [guilds, guild, setGuild]);

    const selectedGuildValue = useMemo(() => {
        if (!guilds || guilds.length === 0) return undefined;
        if (!guild) return undefined;
        return guilds.some((g) => g.id === guild) ? guild : undefined;
    }, [guilds, guild]);

    async function handleSaveTemplate() {
        if (!user) return;
        const randomTemplateId = nanoid(10);

        const { error } = await supabase.from("templates").insert({
            template_id: randomTemplateId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uid: user.id,
            components: components as unknown as Json,
            name: newTemplateName,
        });

        if (error) {
            return toast.error("Something went wrong");
        } else {
            window.location.href = `/${randomTemplateId}`;
        }
    }

    async function handleUpdateMessage(redirectToLogin = false) {
        if (!user) return;

        const { error } = await supabase.from("templates").upsert({
            template_id: templateId,
            components: components as unknown as Json,
            updated_at: new Date().toISOString(),
            uid: user.id,
        });

        if (error) {
            toast.error("Something went wrong");
        } else {
            if (redirectToLogin) {
                window.location.href = `/auth/login?prompt=none&redirect=/${templateId}`;
            } else {
                toast.success("Saved");
            }
        }
    }

    return (
        <>
            <div className="flex justify-between gap-2 p-4 overflow-x-auto border-b border-dashed">
                <div className="flex gap-2 items-center">
                    <a href="/" className="hidden lg:block mr-2">
                        <Image
                            src="/logo.svg"
                            className="min-w-[30px] max-w-[30px]"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    </a>

                    {user === null && (
                        <Button
                            variant="secondary"
                            className="border border-green-400/25 bg-green-400/10 hover:bg-green-400/5 text-green-400 hover:text-green-400"
                            asChild
                        >
                            <a href="/auth/login">
                                <LogInIcon />
                                Sign In
                            </a>
                        </Button>
                    )}

                    {user ? (
                        <>
                            {/* GUILD SELECTOR */}
                            <Select
                                value={selectedGuildValue}
                                onValueChange={(value) => setGuild(value ?? null)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue
                                        placeholder={
                                            <div className="flex gap-2 items-center">
                                                <HouseIcon />
                                                <span>Select a guild</span>
                                            </div>
                                        }
                                    >
                                        <HouseIcon />
                                        {
                                            guilds?.find(
                                                (guild) => guild?.id === selectedGuildValue,
                                            )?.name
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-w-[200px]">
                                    <SelectGroup>
                                        <SelectLabel className="flex justify-between">
                                            <span>Guilds</span>
                                            <Button
                                                variant={"ghost"}
                                                size="icon"
                                                className="size-4"
                                                onClick={() => {
                                                    if (templateId === "new") {
                                                        setShowNewTemplateDialog(
                                                            !showNewTemplateDialog,
                                                        );
                                                    } else {
                                                        handleUpdateMessage(true);
                                                    }
                                                }}
                                            >
                                                <RefreshCwIcon />
                                            </Button>
                                        </SelectLabel>
                                        {guilds?.map((guild) => (
                                            <SelectItem value={guild.id} key={`${guild.id}`}>
                                                <span className="overflow-ellipsis">
                                                    {guild.name as string}
                                                </span>
                                            </SelectItem>
                                        ))}
                                        {guilds === null && (
                                            <SelectItem
                                                className="text-xs justify-center p-6"
                                                value="balls"
                                                disabled
                                            >
                                                Failed to fetch guilds
                                            </SelectItem>
                                        )}
                                        {guilds?.length === 0 && (
                                            <SelectItem
                                                className="text-xs justify-center p-6"
                                                value="balls"
                                                disabled
                                            >
                                                No guilds found
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <ChevronRightIcon className="size-4 opacity-75" />

                            {/* TEMPLATE SELECTOR */}
                            <Select
                                value={
                                    templateId === "new" ||
                                    !templates?.some((t) => t.template_id === templateId)
                                        ? undefined
                                        : templateId
                                }
                                onValueChange={(value) => router.push(`/${value}`)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue
                                        placeholder={
                                            <div className="flex gap-2 items-center">
                                                <MessageSquareIcon />
                                                <span>Select a message</span>
                                            </div>
                                        }
                                    >
                                        <MessageSquareIcon />
                                        {
                                            templates?.find(
                                                (template) => template.template_id === templateId,
                                            )?.name
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-w-[200px]">
                                    <SelectGroup>
                                        <SelectLabel className="flex justify-between">
                                            <span>Messages</span>
                                            <Button
                                                variant={"ghost"}
                                                size="icon"
                                                className="size-4"
                                                asChild
                                            >
                                                <a href={"/new"}>
                                                    <PlusIcon />
                                                </a>
                                            </Button>
                                        </SelectLabel>
                                        {templates?.map((template, index) => (
                                            <SelectItem
                                                value={template.template_id as string}
                                                key={`${template.name ?? "undefined"}-${index}`}
                                            >
                                                <span className="overflow-ellipsis">
                                                    {template.name as string}
                                                </span>
                                            </SelectItem>
                                        ))}
                                        {templates === null && (
                                            <SelectItem value="balls">Select a message</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </>
                    ) : (
                        user === undefined &&
                        templates === null &&
                        guilds === null && <Skeleton className="w-[432px] h-full" />
                    )}
                </div>

                <div className="flex gap-2">
                    {/* UNDO/REDO BUTTONS */}
                    <Button variant="ghost" size="icon">
                        <UndoIcon />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <RedoIcon />
                    </Button>

                    {/* CLEAR COMPONENS BUTTON */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <EraserIcon />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Clear components</DialogTitle>
                                <DialogDescription>
                                    This will remove all components in this message.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button
                                        variant={"destructive"}
                                        onClick={() => setComponents(defaultComponents)}
                                    >
                                        Confirm
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* SAVE MESSAGE BUTTON */}
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        disabled={!user}
                        onClick={() => {
                            if (templateId === "new") {
                                setShowNewTemplateDialog(!showNewTemplateDialog);
                            } else {
                                handleUpdateMessage();
                            }
                        }}
                    >
                        <SaveIcon />
                    </Button> */}

                    <Separator orientation="vertical" />

                    {/* ACTIONS BUTTON */}
                    <ActionsButton templateId={templateId} />

                    {/* ADD COMPONENT BUTTON */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"outline"}>
                                <PlusIcon />
                                Add Component
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {componentsList.map((component, index) => (
                                <Fragment key={`${component.type}-${index}`}>
                                    {component.name === "Container" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                                Layout
                                            </DropdownMenuLabel>
                                        </>
                                    )}
                                    {component.name === "Buttons" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                                Interactive
                                            </DropdownMenuLabel>
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        onClick={component.onClick}
                                        disabled={component.disabled}
                                    >
                                        <component.icon className="text-muted-foreground" />
                                        {component.name}
                                    </DropdownMenuItem>
                                </Fragment>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* SAVE MESSAGE DIALOG */}
            <Dialog onOpenChange={setShowNewTemplateDialog} open={showNewTemplateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription>Create new message template</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="new-template-name">Name</Label>
                        <Input
                            id="new-template-name"
                            placeholder="Enter name"
                            onChange={(e) => setNewTemplateName(e.currentTarget.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button onClick={handleSaveTemplate}>Confirm</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
