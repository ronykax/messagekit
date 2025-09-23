import type {
    APIMessageTopLevelComponent,
    RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";
import {
    DownloadIcon,
    EraserIcon,
    PlusIcon,
    SaveIcon,
    SettingsIcon,
    SquareDashedMousePointerIcon,
    UploadIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGuildStore } from "@/lib/stores/guild";
import { useInspectingStore } from "@/lib/stores/inspecting";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { componentDescriptors, defaultComponents } from "@/utils/constants";
import { append } from "@/utils/functions";
import ActionsButton from "../actions-button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const supabase = createClient();

export default function EditorNavbar({
    setComponents,
    components,
    templateId,
}: {
    setComponents: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    components: APIMessageTopLevelComponent[];
    templateId: string;
}) {
    const router = useRouter();
    const [fetched, setFetched] = useState(false);

    // stores
    const { inspecting, setInspecting } = useInspectingStore();
    const { user } = useUserStore();
    const { setGuild } = useGuildStore();

    // templates
    const [templates, setTemplates] = useState<Record<string, unknown>[] | null>(null);
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    // guilds
    const [guilds, setGuilds] = useState<RESTAPIPartialCurrentUserGuild[] | null>(null);

    // misc
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            .select("template_id, name")
            .limit(10)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch messages!");
                } else {
                    setTemplates(data);
                }
            });

        fetch("/api/discord/guilds")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setGuilds(data.guilds);
            });

        setFetched(true);
    }, [user, fetched]);

    function handleExport() {
        const download = new Blob([JSON.stringify(components, null, 4)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(download);

        const a = document.createElement("a");
        a.href = url;
        a.download = "msgkit-export.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        setComponents(data);
    }

    async function handleSaveTemplate() {
        if (!user) return;
        const randomTemplateId = nanoid(10);

        const { error } = await supabase.from("templates").insert({
            template_id: randomTemplateId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: user.id,
            components: components,
            name: newTemplateName,
        });

        if (error) {
            return toast.error("Something went wrong!");
        }

        window.location.href = `/${randomTemplateId}`;
    }

    async function handleUpdateMessage() {
        if (!user) return;

        const { error } = await supabase.from("templates").upsert({
            template_id: templateId,
            components: components,
            updated_at: new Date().toISOString(),
            user: user.id,
        });

        if (error) {
            return toast.error("Something went wrong!");
        } else {
            toast.success("Saved!");
        }
    }

    function getAndSetGuild(guildId: string) {
        fetch(`/api/discord/guilds/${guildId}`)
            .then((res) => res.json())
            .then((data) => {
                setGuild(data.guild);
            });
    }

    return (
        <>
            <div className="flex justify-between gap-2 p-4 overflow-x-auto border-b border-dashed">
                <div className="flex gap-2 items-center">
                    <a href="/">
                        <Image
                            src="/logo.svg"
                            className="min-w-[30px] max-w-[30px] hidden md:block"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    </a>

                    <Separator orientation="vertical" className="opacity-0 hidden md:block" />

                    {/* TEMPLATE SELECTOR */}
                    {user && (
                        <Select
                            defaultValue={templateId === "new" ? undefined : templateId}
                            onValueChange={(value) => router.push(`/${value}`)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select a message" />
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
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                    {user === undefined && <Skeleton className="w-[200px] h-full" />}

                    {/* GUILD SELECTOR */}
                    {user && (
                        <Select onValueChange={(value) => getAndSetGuild(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select a guild" />
                            </SelectTrigger>
                            <SelectContent className="max-w-[200px]">
                                <SelectGroup>
                                    <SelectLabel className="flex justify-between">
                                        <span>Guilds</span>
                                        <Button
                                            variant={"ghost"}
                                            size="icon"
                                            className="size-4"
                                            asChild
                                        >
                                            <a href={"https://discord.gg/5bBM2TVDD3"}>
                                                <PlusIcon />
                                            </a>
                                        </Button>
                                    </SelectLabel>
                                    {guilds?.map((guild) => (
                                        <SelectItem value={guild.id} key={`${guild.id}`}>
                                            <span className="overflow-ellipsis">
                                                {guild.name as string}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                    {user === undefined && <Skeleton className="w-[200px] h-full" />}

                    <Button variant="outline" size="icon">
                        <SettingsIcon />
                    </Button>
                </div>

                <div className="flex gap-2">
                    {/* EXPORT/IMPORT BUTTONS */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleExport}>
                                <UploadIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export as JSON</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <DownloadIcon />
                                <input
                                    className="sr-only"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImport}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Import from JSON</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" />

                    {/* INSPECT BUTTON */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={inspecting ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => {
                                    setInspecting(!inspecting);
                                }}
                                className="hidden md:inline-flex"
                            >
                                <SquareDashedMousePointerIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Inspect</TooltipContent>
                    </Tooltip>

                    {/* CLEAR COMPONENS BUTTON */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <EraserIcon />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
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
                    <Button
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
                    </Button>

                    <Separator orientation="vertical" />

                    {/* ACTIONS LINK BUTTON */}
                    {/* <Button variant="ghost" asChild={templateId !== "new"} disabled={templateId === "new"}>
                        {templateId === "new" ? (
                            <>
                                <PickaxeIcon />
                                Actions
                            </>
                        ) : (
                            <Link href={`${templateId}/actions`}>
                                <PickaxeIcon />
                                Actions
                            </Link>
                        )}
                    </Button> */}

                    <ActionsButton templateId={templateId} templates={templates} />

                    {/* ADD COMPONENT BUTTON */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"outline"}>
                                <PlusIcon />
                                Add Component
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* <DropdownMenuLabel className="text-xs text-muted-foreground">Content</DropdownMenuLabel> */}
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
                                        <component.icon />
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
