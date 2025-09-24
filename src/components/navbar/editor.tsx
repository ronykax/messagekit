import type { APIMessageTopLevelComponent } from "discord-api-types/v10";
import {
    ChevronRightIcon,
    DownloadIcon,
    EraserIcon,
    HouseIcon,
    MessageSquareIcon,
    PlusIcon,
    RefreshCwIcon,
    SaveIcon,
    SquareDashedMousePointerIcon,
    UploadIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    type Dispatch,
    Fragment,
    type SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import { useDataStore } from "@/lib/stores/data";
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

    // stores
    const { user } = useUserStore();
    const { inspecting, setInspecting } = useInspectingStore();
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
            .eq("uid", user.id)
            .limit(25)
            .then(({ data, error }) => {
                if (error) toast.error("Failed to fetch messages");
                else setTemplates(data);
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
            uid: user.id,
            components: components,
            name: newTemplateName,
        });

        if (error) {
            return toast.error("Something went wrong");
        } else {
            window.location.href = `/${randomTemplateId}`;
        }
    }

    async function handleUpdateMessage() {
        if (!user) return;

        const { error } = await supabase.from("templates").upsert({
            template_id: templateId,
            components: components,
            updated_at: new Date().toISOString(),
            uid: user.id,
        });

        if (error) {
            toast.error("Something went wrong");
        } else {
            toast.success("Saved");
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

                    {/* GUILD SELECTOR */}
                    {user ? (
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
                                />
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
                                            <a
                                                href={`/auth/login?prompt=none&redirect=/${templateId}`}
                                            >
                                                <RefreshCwIcon />
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
                    ) : user === undefined ? (
                        guilds === null && <Skeleton className="w-[200px] h-full" />
                    ) : null}

                    {user && <ChevronRightIcon className="size-4 opacity-75" />}

                    {/* TEMPLATE SELECTOR */}
                    {user ? (
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
                                />
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
                    ) : user === undefined ? (
                        templates === null && <Skeleton className="w-[200px] h-full" />
                    ) : null}

                    {/* <Button variant="outline" size="icon">
                        <SettingsIcon />
                    </Button> */}
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
                                className="hidden lg:inline-flex"
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
