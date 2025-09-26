import { SiDiscord } from "@icons-pack/react-simple-icons";
import { type APIMessageTopLevelComponent, MessageFlags } from "discord-api-types/v10";
import {
    BotIcon,
    CheckIcon,
    DownloadIcon,
    EditIcon,
    EllipsisIcon,
    ExternalLinkIcon,
    LogOutIcon,
    SaveIcon,
    SendIcon,
    UploadIcon,
    WebhookIcon,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfettiStore } from "@/lib/stores/confetti";
import { useFiles } from "@/lib/stores/files";
import { useGuildStore } from "@/lib/stores/guild";
import { useOutputStore } from "@/lib/stores/output";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import type { SendOptions } from "@/utils/types";
import HelperText from "../helper-text";
import ChannelSelector from "../select/channels";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

export default function PreviewNavbar({
    components,
    setComponents,
}: {
    components: APIMessageTopLevelComponent[];
    setComponents: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
}) {
    const { user } = useUserStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="p-4 flex items-center justify-between border-b border-dashed overflow-x-auto">
            <div className="flex items-center gap-2">
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={"icon"} variant={"ghost"}>
                            <EllipsisIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <a
                                href="https://discord.com/oauth2/authorize?client_id=1067725778512519248"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer"
                            >
                                <ExternalLinkIcon />
                                Add App
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <a
                                href="https://discord.gg/5bBM2TVDD3"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer"
                            >
                                <SiDiscord />
                                Get Support
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild variant="destructive">
                            <a href="/auth/logout" className="cursor-pointer">
                                <LogOutIcon />
                                Logout
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
                {user === undefined ? (
                    <Skeleton />
                ) : (
                    user === null && (
                        <Button variant="ghost" asChild>
                            <a href="/auth/login">
                                <SiDiscord />
                                Sign In
                            </a>
                        </Button>
                    )
                )}

                <Button className="" variant={"outline"}>
                    <SaveIcon />
                    Save
                </Button>

                <SendMessageButton />
            </div>
        </div>
    );
}

function SendMessageButton() {
    const { output } = useOutputStore();
    const { user } = useUserStore();

    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("");
    const [selectedTab, setSelectedTab] = useState<"webhook" | "bot" | "server">("webhook");
    const { guild } = useGuildStore();

    useEffect(() => {
        const saved = localStorage.getItem("webhookUrl");
        if (saved) setWebhookUrl(saved);
    }, []);

    const webhookIsValid = useMemo(() => {
        if (webhookUrl.trim().length === 0) return false;
        try {
            new URL(webhookUrl);
            return true;
        } catch {
            return false;
        }
    }, [webhookUrl]);

    const botIsValid = useMemo(() => {
        if (selectedChannel.trim().length === 0) return false;
        return true;
    }, [selectedChannel]);

    const { files } = useFiles();
    const { setConfetti } = useConfettiStore();

    async function handleSendMessage() {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("images", file);
        });

        formData.append(
            "message",
            JSON.stringify({
                components: output,
                flags: MessageFlags.IsComponentsV2,
            }),
        );

        formData.append(
            "options",
            JSON.stringify({
                via: selectedTab === "webhook" ? "webhook" : "bot",
                channel_id: selectedTab === "bot" ? selectedChannel : undefined,
                webhook_url: selectedTab === "webhook" ? webhookUrl : undefined,
            } as SendOptions),
        );

        await fetch("/api/discord/send", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Error sending message:", JSON.stringify(data));

                if (data.success) {
                    toast.success("Sent!");
                    localStorage.setItem("webhookUrl", webhookUrl);
                    setConfetti(true);
                } else {
                    toast.error("Something went wrong", {
                        description: data.error?.message ?? null,
                    });
                }
            });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={output.length === 0}>
                    <SendIcon />
                    Send Message
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Message</DialogTitle>
                    <DialogDescription>
                        {selectedTab === "webhook"
                            ? "Send a message via webhook."
                            : selectedTab === "bot"
                              ? "Send a message via the Message Kit app."
                              : "Edit an existing message."}
                    </DialogDescription>
                </DialogHeader>
                <Tabs
                    onValueChange={(value) => setSelectedTab(value as "webhook" | "bot" | "server")}
                    defaultValue={selectedTab}
                >
                    <TabsList className="mb-4 w-full">
                        <TabsTrigger value="webhook">
                            <WebhookIcon />
                            Webhook
                        </TabsTrigger>
                        <TabsTrigger
                            value="bot"
                            disabled={user === null || user === undefined || guild === null}
                        >
                            <BotIcon />
                            Bot
                        </TabsTrigger>
                        <TabsTrigger value="edit" disabled>
                            <EditIcon />
                            Edit
                        </TabsTrigger>
                    </TabsList>
                    <div
                        className={cn(
                            "flex flex-col gap-2",
                            selectedTab === "webhook" ? "flex" : "hidden",
                        )}
                    >
                        <Label>
                            Webhook URL
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            placeholder="Enter webhook URL"
                            value={webhookUrl}
                            inputMode="url"
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="wrap-anywhere"
                        />
                        <HelperText text="Non-link buttons cannot be sent through webhooks." />
                    </div>
                    <div
                        className={cn(
                            "flex flex-col gap-2",
                            selectedTab === "bot" ? "flex" : "hidden",
                        )}
                    >
                        <Label>
                            Channel<span className="text-destructive">*</span>
                        </Label>
                        <ChannelSelector onChannelChange={setSelectedChannel} />
                        <HelperText text="Make sure Message Kit can send messages in the selected channel." />
                    </div>
                </Tabs>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            disabled={selectedTab === "bot" ? !botIsValid : !webhookIsValid}
                            onClick={handleSendMessage}
                        >
                            <CheckIcon />
                            Confirm
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
