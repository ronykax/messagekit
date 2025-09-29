import { SiDiscord } from "@icons-pack/react-simple-icons";
import {
    type APIGuild,
    type APIMessageTopLevelComponent,
    MessageFlags,
} from "discord-api-types/v10";
import {
    BotIcon,
    CheckIcon,
    EditIcon,
    EllipsisIcon,
    ExternalLinkIcon,
    LogOutIcon,
    SaveIcon,
    SendIcon,
    WebhookIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfettiStore } from "@/lib/stores/confetti";
import { useFiles } from "@/lib/stores/files";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Json } from "@/utils/database.types";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RainbowButton } from "../ui/rainbow-button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

const supabase = createClient();

export default function PreviewNavbar({
    items,
    guild,
    messageId,
}: {
    items: APIMessageTopLevelComponent[];
    setItems: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    messageId: string;
    guild: APIGuild;
}) {
    const { user } = useUserStore();

    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    async function handleUpdateMessage() {
        if (!user) return;

        const { error } = await supabase.from("messages").upsert({
            id: messageId,
            items: items as unknown as Json,
            updated_at: new Date().toISOString(),
            uid: user.id,
        });

        if (error) {
            toast.error("Something went wrong");
        } else {
            toast.success("Saved");
        }
    }

    async function handleSaveTemplate() {
        if (!user) return;
        const randomTemplateId = nanoid(10);

        const { error } = await supabase.from("messages").insert({
            id: randomTemplateId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uid: user.id,
            items: items as unknown as Json,
            name: newTemplateName,
        });

        if (error) {
            return toast.error("Something went wrong");
        } else {
            window.location.href = `/${guild.id}/${randomTemplateId}`;
        }
    }

    return (
        <>
            <div className="p-4 flex items-center justify-between border-b border-dashed overflow-x-auto">
                <div className="flex items-center gap-2">
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
                    {user === null ? (
                        <RainbowButton variant="default" asChild className="text-black">
                            <a href="/auth/login">
                                <SiDiscord />
                                Sign In
                            </a>
                        </RainbowButton>
                    ) : (
                        user && (
                            <Button
                                variant={"outline"}
                                onClick={() => {
                                    if (messageId === "new") {
                                        setShowNewTemplateDialog(!showNewTemplateDialog);
                                    } else {
                                        handleUpdateMessage();
                                    }
                                }}
                                disabled={!user || items.length === 0}
                            >
                                <SaveIcon />
                                Save
                            </Button>
                        )
                    )}

                    <SendMessageButton items={items} guild={guild} />
                </div>
            </div>
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

function SendMessageButton({
    items,
    guild,
}: {
    items: APIMessageTopLevelComponent[];
    guild: APIGuild;
}) {
    const { user } = useUserStore();

    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("");
    const [selectedTab, setSelectedTab] = useState<"webhook" | "bot" | "server">("webhook");

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
                components: items,
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
                <RainbowButton className="text-black cursor-pointer" disabled={items.length === 0}>
                    <SendIcon />
                    Send Message
                </RainbowButton>
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
                            disabled={user === null || user === undefined || guild.id === null}
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
                        <ChannelSelector onChannelChange={setSelectedChannel} guild={guild} />
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
