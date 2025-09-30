import {
    type APIGuild,
    type APIMessageTopLevelComponent,
    CDNRoutes,
    ImageFormat,
    RouteBases,
} from "discord-api-types/v10";
import {
    ChevronRightIcon,
    DownloadIcon,
    EditIcon,
    EllipsisIcon,
    EraserIcon,
    ExternalLinkIcon,
    PlusIcon,
    Trash2Icon,
    UploadIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { componentDescriptors, defaultComponents } from "@/utils/constants";
import { append } from "@/utils/functions";
import { useUserStore } from "@/utils/stores/user";
import type { RowMessage } from "@/utils/types";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

const supabase = createClient();

export default function EditorNavbar({
    setItems,
    items,
    messageId,
    guild,
}: {
    setItems: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    items: APIMessageTopLevelComponent[];
    guild: APIGuild;
    messageId: string;
}) {
    const router = useRouter();
    const { user } = useUserStore();

    const [messages, setMessages] = useState<RowMessage[]>([]);

    const addComponent = <T extends APIMessageTopLevelComponent>(component: T) =>
        setItems((previousComponents) => append(previousComponents, component));

    useEffect(() => {
        supabase
            .from("messages")
            .select("*")
            .eq("guild_id", guild.id)
            .limit(25)
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch messages");
                } else {
                    setMessages(data);
                }
            });
    }, [guild.id]);

    const componentsList = componentDescriptors.map((descriptor) => ({
        name: descriptor.name,
        type: descriptor.type,
        icon: descriptor.icon,
        onClick: () => addComponent(descriptor.create() as APIMessageTopLevelComponent),
        disabled: descriptor.disabled,
    }));

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleExport() {
        const download = new Blob([JSON.stringify(items, null, 4)], {
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

        setItems(data);
    }

    return (
        <div className="flex justify-between gap-2 p-4 overflow-x-auto border-b border-dashed">
            <div className="flex gap-2 items-center">
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="size-9 border rounded-md cursor-pointer overflow-hidden"
                                title={guild.name}
                            >
                                {guild.icon ? (
                                    <Image
                                        src={
                                            RouteBases.cdn +
                                            CDNRoutes.guildIcon(
                                                guild.id,
                                                guild.icon,
                                                guild.icon.startsWith("a_")
                                                    ? ImageFormat.GIF
                                                    : ImageFormat.WebP,
                                            )
                                        }
                                        className="size-full"
                                        alt="Logo"
                                        width={32}
                                        height={32}
                                        unoptimized
                                    />
                                ) : (
                                    <div className="size-full bg-primary text-sm font-medium flex items-center justify-center">
                                        {guild.name
                                            .trim()
                                            .split(/\s+/)
                                            .slice(0, 2)
                                            .map((w) => w[0].toUpperCase())
                                            .join("")}
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                            <DropdownMenuLabel className="text-xs text-muted-foreground flex justify-between">
                                <span className="truncate w-[100px]">{guild.name}</span>
                                <span>{guild.approximate_member_count} members</span>
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <a href={"/select-guild"} className="cursor-pointer">
                                    Switch to another server
                                    <ExternalLinkIcon />
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* <div className="flex flex-col gap-1.5">
                        <span className="font-display font-medium leading-none text-nowrap">{guild.name}</span>
                        <span className="text-muted-foreground leading-none text-xs">{guild.approximate_member_count} members</span>
                    </div> */}
                </div>

                <ChevronRightIcon className="size-4 opacity-75" />

                {user === undefined && messages === null ? (
                    <Skeleton className="w-[200px] h-full" />
                ) : (
                    <Select
                        value={
                            messageId === "new" ||
                            !messages.some((message) => message.id === messageId)
                                ? ""
                                : messageId
                        }
                        onValueChange={(value) => router.push(`/${guild.id}/${value}`)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a message" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel className="flex justify-between">
                                    <span>Messages</span>
                                    {user && messageId !== "new" ? (
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="size-4"
                                        >
                                            <Link href={`/${guild.id}`}>
                                                <PlusIcon />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-4"
                                            disabled
                                        >
                                            <PlusIcon />
                                        </Button>
                                    )}
                                </SelectLabel>

                                {/* If user is logged out show single disabled hint */}
                                {user === null ? (
                                    <SelectItem
                                        className="text-xs justify-center p-6"
                                        value="login"
                                        disabled
                                    >
                                        Log in to save messages
                                    </SelectItem>
                                ) : (
                                    messages.map((template, index) => (
                                        <SelectItem
                                            value={template.id as string}
                                            key={`${template.name ?? "undefined"}-${index}`}
                                        >
                                            <span className="overflow-ellipsis">
                                                {template.name as string}
                                            </span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant={"ghost"}>
                            <EllipsisIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem disabled>
                            <EditIcon />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">
                            <Trash2Icon />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex gap-2">
                {/* CLEAR COMPONENS BUTTON */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost">
                            <EraserIcon />
                            Clear All
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
                                    onClick={() => setItems(defaultComponents)}
                                >
                                    Confirm
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* UNDO/REDO BUTTONS */}
                <div className="inline-flex w-fit -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
                    <Button
                        variant="outline"
                        className="rounded-none rounded-l-md shadow-none focus-visible:z-10"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <DownloadIcon />
                        Import
                        <input
                            className="sr-only"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-none rounded-r-md shadow-none focus-visible:z-10"
                        onClick={handleExport}
                    >
                        <UploadIcon />
                        Export
                    </Button>
                </div>

                {/* ACTIONS BUTTON */}
                <ActionsButton messageId={messageId} guild={guild} />

                {/* ADD COMPONENT BUTTON */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <PlusIcon />
                            Add Item
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
    );
}
