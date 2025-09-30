"use client";

import {
    type APIActionRowComponent,
    type APIButtonComponent,
    type APIContainerComponent,
    type APIFileComponent,
    type APIGuild,
    type APIMediaGalleryComponent,
    type APIMessageTopLevelComponent,
    type APISeparatorComponent,
    ComponentType,
    SeparatorSpacingSize,
} from "discord-api-types/v10";
import { AnimatePresence } from "motion/react";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { defaultComponents } from "@/utils/constants";
import { moveItem, randomNumber, removeAt, updateAt } from "@/utils/functions";
import { useUserStore } from "@/utils/stores/user";
import ButtonGroup from "../editor/button-group";
import Container from "../editor/container";
import File from "../editor/file";
import MediaGallery from "../editor/media-gallery";
import YesSeparator from "../editor/separator";
import TextDisplay from "../editor/text-display";
import ItemsValidator from "../editor/validator";
import EditorNavbar from "../navbar/editor";

const supabase = createClient();

export default function EditorPanel({
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
    const { user } = useUserStore();

    const hasFetchedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        if (messageId === "new") {
            const saved = localStorage.getItem("output-json");

            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                }
            } else {
                setItems(defaultComponents);
            }

            return;
        }

        if (hasFetchedRef.current === messageId) return;

        supabase
            .from("messages")
            .select("items")
            .eq("id", messageId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    toast.error("Failed to fetch message");
                } else {
                    setItems(data.items as unknown as APIMessageTopLevelComponent[]);
                    hasFetchedRef.current = messageId;
                }
            });
    }, [messageId, setItems, user?.id]);

    return (
        <div className="max-h-[100svh] flex flex-col h-full">
            <EditorNavbar setItems={setItems} items={items} messageId={messageId} guild={guild} />
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                <AnimatePresence>
                    <ItemsValidator key="alert" components={items} />
                    <Items
                        key="components"
                        items={items}
                        setItems={setItems}
                        guild={guild}
                        messageId={messageId}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
}

function Items({
    items,
    setItems,
    guild,
    messageId,
}: {
    items: APIMessageTopLevelComponent[];
    setItems: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
    guild: APIGuild;
    messageId: string;
}) {
    const handleMove = (index: number, direction: "up" | "down") =>
        setItems((previousComponents) => moveItem(previousComponents, index, direction));

    const handleRemove = (index: number) =>
        setItems((previousComponents) => removeAt(previousComponents, index));

    return items.map((component, index) => {
        if (component.type === ComponentType.TextDisplay) {
            return (
                <TextDisplay
                    key={component.id}
                    content={component.content}
                    onContentChange={(content) =>
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                ...component,
                                content: content,
                            })),
                        )
                    }
                    setAccessory={(accessory) =>
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                id: component.id,
                                type: ComponentType.Section,
                                components: [
                                    {
                                        type: ComponentType.TextDisplay,
                                        content: component.content,
                                    },
                                ],
                                accessory: accessory,
                            })),
                        )
                    }
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    guild={guild}
                    messageId={messageId}
                />
            );
        } else if (component.type === ComponentType.Section) {
            return (
                <TextDisplay
                    key={component.id}
                    content={component.components[0].content}
                    onContentChange={(content) =>
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                ...component,
                                components: [{ ...component.components[0], content: content }],
                            })),
                        )
                    }
                    accessory={component.accessory}
                    setAccessory={(accessory) =>
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                id: randomNumber(),
                                ...component,
                                accessory: accessory,
                            })),
                        )
                    }
                    removeAccessory={() =>
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                id: component.id,
                                type: ComponentType.TextDisplay,
                                content: component.components[0].content,
                            })),
                        )
                    }
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    guild={guild}
                    messageId={messageId}
                />
            );
        } else if (component.type === ComponentType.Separator) {
            return (
                <YesSeparator
                    key={component.id}
                    spacing={component.spacing ?? SeparatorSpacingSize.Small}
                    divider={component.divider ?? true}
                    onChangeSpacing={(size) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APISeparatorComponent),
                                spacing: size,
                            })),
                        );
                    }}
                    onChangeDivider={(value) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APISeparatorComponent),
                                divider: value,
                            })),
                        );
                    }}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                />
            );
        } else if (component.type === ComponentType.MediaGallery) {
            return (
                <MediaGallery
                    key={component.id}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    images={component.items}
                    setImages={(images) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIMediaGalleryComponent),
                                items: images,
                            })),
                        );
                    }}
                />
            );
        } else if (component.type === ComponentType.Container) {
            return (
                <Container
                    key={component.id}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    components={component.components}
                    setComponents={(childComponents) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIContainerComponent),
                                components: childComponents,
                            })),
                        );
                    }}
                    color={component.accent_color ?? null}
                    setColor={(color) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIContainerComponent),
                                accent_color: color,
                            })),
                        );
                    }}
                    guild={guild}
                    messageId={messageId}
                />
            );
        } else if (component.type === ComponentType.ActionRow) {
            return (
                <ButtonGroup
                    key={component.id}
                    components={component.components as APIButtonComponent[]}
                    setComponents={(components) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIActionRowComponent<APIButtonComponent>),
                                components: components,
                            })),
                        );
                    }}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    guild={guild}
                    messageId={messageId}
                />
            );
        } else if (component.type === ComponentType.File) {
            return (
                <File
                    key={component.id}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    spoiler={component.spoiler ?? false}
                    onChangeSpoiler={(value) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIFileComponent),
                                spoiler: value,
                            })),
                        );
                    }}
                    file={component}
                    setFile={(file) => {
                        setItems((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIFileComponent),
                                file: file.file,
                            })),
                        );
                    }}
                />
            );
        }

        return null;
    });
}
