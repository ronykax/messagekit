"use client";

import type { APIMessageTopLevelComponent } from "discord-api-types/v10";
import { EyeIcon, SlidersVerticalIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditorPanel from "@/components/panels/editor";
import PreviewPanel from "@/components/panels/preview";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOutputStore } from "@/lib/stores/output";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { defaultComponents } from "@/utils/constants";
import { useUserStore } from "@/lib/stores/user";

const LEFT = 62.5;

export default function Page() {
    const { message: templateId } = useParams();
    const router = useRouter();

    const [selectedTab, setSelectedTab] = useState<"editor" | "preview">("editor");
    const [components, setComponents] = useState<APIMessageTopLevelComponent[]>([]);

    const editor = (
        <EditorPanel
            components={components}
            setComponents={setComponents}
            templateId={`${templateId}`}
        />
    );
    const preview = <PreviewPanel />;

    const { setOutput } = useOutputStore();
    const { user } = useUserStore();

    useEffect(() => {
        if (!user) return;

        const run = async () => {
            if (templateId === "new") {
                const saved = localStorage.getItem("output-json");

                if (saved) {
                    const parsed = JSON.parse(saved);

                    if (Array.isArray(parsed)) {
                        setComponents(parsed);
                    }
                } else {
                    setComponents(defaultComponents);
                }

                return;
            }

            const supabase = createClient();

            const { data, error } = await supabase
                .from("templates")
                .select("*")
                .filter("template_id", `eq`, templateId)
                .eq("uid", user.id)
                .single();

            if (error) {
                router.push("/new");
            } else {
                return setComponents(data.components);
            }
        };

        run();
    }, [templateId, router, user]);

    useEffect(() => {
        setOutput(components);
    }, [components, setOutput]);

    useEffect(() => {
        if (templateId === "new") {
            document.title = "New Message";
        }
    }, [templateId]);

    return (
        <div className="h-[100svh] flex flex-col">
            {/* Desktop */}
            <div className="hidden md:flex flex-1">
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
            <div className="flex flex-col md:hidden flex-1">
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
                    className={cn("size-full overflow-auto", selectedTab !== "editor" && "hidden")}
                >
                    {editor}
                </div>
                <div
                    className={cn("size-full overflow-auto", selectedTab !== "preview" && "hidden")}
                >
                    {preview}
                </div>
            </div>
        </div>
    );
}
