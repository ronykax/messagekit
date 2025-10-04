import { SiDiscord } from "@icons-pack/react-simple-icons";
import type { APIGuild, APIMessageTopLevelComponent } from "discord-api-types/v10";
import { CheckIcon, CircleIcon, CopyIcon, DotIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import PreviewNavbar from "../navbar/preview";
import PreviewWrapper from "../preview/wrapper";
import { Button } from "../ui/button";

export default function PreviewPanel({
    items,
    setItems,
    messageId,
    guild,
}: {
    items: APIMessageTopLevelComponent[];
    setItems: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    messageId: string;
    guild: APIGuild;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        }
    }, [copied]);

    return (
        <div className="max-h-[100svh] flex flex-col h-full">
            <PreviewNavbar items={items} setItems={setItems} messageId={messageId} guild={guild} />
            <div className="p-4 whitespace-pre-wrap flex-1 overflow-y-auto">
                <div className="flex flex-col bg-card rounded-xl border overflow-hidden">
                    <div className="p-2 border-b flex items-center justify-between">
                        <div className="ml-1.5 flex items-center gap-2">
                            <CircleIcon className="size-4" fill="#fe5f58" strokeWidth={0} />
                            <CircleIcon className="size-4" fill="#ffbc2e" strokeWidth={0} />
                            <CircleIcon className="size-4" fill="#29c940" strokeWidth={0} />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <SiDiscord className="size-4" />
                            Discord
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(items, null, 4));
                                    setCopied(true);
                                }}
                                disabled={items.length === 0}
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </Button>
                        </div>
                    </div>
                    <PreviewWrapper items={items} />
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <a
                            href="/"
                            className="underline underline-offset-2 hover:text-foreground duration-100"
                        >
                            Terms of Service
                        </a>
                        <DotIcon className="size-4" />
                        <a
                            href="/"
                            className="underline underline-offset-2 hover:text-foreground duration-100"
                        >
                            Privacy Policy
                        </a>
                    </div>
                    <span>© 2025 All Rights Reserved</span>
                </div>
            </div>
        </div>
    );
}
