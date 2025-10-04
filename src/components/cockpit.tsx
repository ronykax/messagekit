"use client";

import type { APIGuild, APIMessageTopLevelComponent } from "discord-api-types/v10";
import { EyeIcon, SlidersVerticalIcon } from "lucide-react";
import { useState } from "react";
import Confetti from "react-confetti-boom";
import EditorPanel from "@/components/panels/editor";
import PreviewPanel from "@/components/panels/preview";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/utils/stores/confetti";

const LEFT = 60;

export default function Cockpit({ messageId, guild }: { messageId: string; guild: APIGuild }) {
    const [selectedTab, setSelectedTab] = useState<"editor" | "preview">("editor");
    const [items, setItems] = useState<APIMessageTopLevelComponent[]>([]);
    const { confetti } = useConfettiStore();

    const editor = (
        <EditorPanel items={items} setItems={setItems} messageId={messageId} guild={guild} />
    );

    const preview = (
        <PreviewPanel items={items} setItems={setItems} guild={guild} messageId={messageId} />
    );

    return (
        <>
            {confetti && (
                <Confetti
                    particleCount={50}
                    shapeSize={12}
                    deg={90}
                    effectCount={35}
                    effectInterval={3000}
                    spreadDeg={75}
                    x={0.5}
                    y={0}
                    launchSpeed={1}
                    opacityDeltaMultiplier={1.5}
                    colors={["#FF69B4", "#00CED1", "#FFD700", "#E6E6FA"]}
                />
            )}
            <div className="h-[100svh] flex flex-col">
                {/* Desktop */}
                <div className="hidden lg:flex flex-1">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={LEFT}>{editor}</ResizablePanel>
                        <ResizableHandle
                            withHandle
                            className="w-0 border-r bg-transparent border-dashed"
                        />
                        <ResizablePanel defaultSize={100 - LEFT}>{preview}</ResizablePanel>
                    </ResizablePanelGroup>
                </div>

                {/* Mobile */}
                <div className="flex flex-col lg:hidden flex-1">
                    <Tabs
                        defaultValue="editor"
                        className="w-full gap-0"
                        onValueChange={(value) => setSelectedTab(value as "editor" | "preview")}
                    >
                        <div className="p-2 border-b m-0 bg-card">
                            <TabsList className="w-full bg-card">
                                <TabsTrigger value="editor">
                                    <SlidersVerticalIcon />
                                    Editor
                                </TabsTrigger>
                                <TabsTrigger value="preview">
                                    <EyeIcon />
                                    Preview
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                    <div
                        className={cn(
                            "size-full overflow-auto",
                            selectedTab !== "editor" && "hidden",
                        )}
                    >
                        {editor}
                    </div>
                    <div
                        className={cn(
                            "size-full overflow-auto",
                            selectedTab !== "preview" && "hidden",
                        )}
                    >
                        {preview}
                    </div>
                </div>
            </div>
        </>
    );
}
