"use client";

import {
    type APIActionRowComponent,
    type APIButtonComponent,
    type APIContainerComponent,
    type APIFileComponent,
    type APIMediaGalleryComponent,
    type APIMessageTopLevelComponent,
    type APISeparatorComponent,
    ComponentType,
    SeparatorSpacingSize,
} from "discord-api-types/v10";
import { AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";
import { defaultComponents } from "@/utils/constants";
import { moveItem, randomNumber, removeAt, updateAt } from "@/utils/functions";
import ComponentsValidator from "../components-validator";
import ButtonGroup from "../editor/button-group";
import Container from "../editor/container";
import File from "../editor/file";
import MediaGallery from "../editor/media-gallery";
import YesSeparator from "../editor/separator";
import TextDisplay from "../editor/text-display";
import EditorNavbar from "../navbar/editor";

export default function EditorPanel({
    components,
    setComponents,
}: {
    components: APIMessageTopLevelComponent[];
    setComponents: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
}) {
    const router = useRouter();
    const { message: templateId } = useParams();

    const { user } = useUserStore();

    useEffect(() => {
        if (!user?.id) return;

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
    }, [templateId, router, user?.id, setComponents]);

    return (
        <div className="max-h-[100svh] flex flex-col h-full">
            <EditorNavbar
                setComponents={setComponents}
                components={components}
                templateId={`${templateId}`}
            />
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                <AnimatePresence>
                    <ComponentsValidator key="alert" />
                    <Components
                        key="components"
                        components={components}
                        setComponents={setComponents}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
}

function Components({
    components,
    setComponents,
}: {
    components: APIMessageTopLevelComponent[];
    setComponents: Dispatch<SetStateAction<APIMessageTopLevelComponent[]>>;
}) {
    const handleMove = (index: number, direction: "up" | "down") =>
        setComponents((previousComponents) => moveItem(previousComponents, index, direction));

    const handleRemove = (index: number) =>
        setComponents((previousComponents) => removeAt(previousComponents, index));

    return components.map((component, index) => {
        if (component.type === ComponentType.TextDisplay) {
            return (
                <TextDisplay
                    key={component.id}
                    component={component}
                    content={component.content}
                    onContentChange={(content) =>
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                ...component,
                                content: content,
                            })),
                        )
                    }
                    setAccessory={(accessory) =>
                        setComponents((previousComponents) =>
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
                />
            );
        } else if (component.type === ComponentType.Section) {
            return (
                <TextDisplay
                    key={component.id}
                    component={component}
                    content={component.components[0].content}
                    onContentChange={(content) =>
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                ...component,
                                components: [{ ...component.components[0], content: content }],
                            })),
                        )
                    }
                    accessory={component.accessory}
                    setAccessory={(accessory) =>
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, () => ({
                                id: randomNumber(),
                                ...component,
                                accessory: accessory,
                            })),
                        )
                    }
                    removeAccessory={() =>
                        setComponents((previousComponents) =>
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
                />
            );
        } else if (component.type === ComponentType.Separator) {
            return (
                <YesSeparator
                    key={component.id}
                    component={component}
                    spacing={component.spacing ?? SeparatorSpacingSize.Small}
                    divider={component.divider ?? true}
                    onChangeSpacing={(size) => {
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APISeparatorComponent),
                                spacing: size,
                            })),
                        );
                    }}
                    onChangeDivider={(value) => {
                        setComponents((previousComponents) =>
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
                    component={component}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    images={component.items}
                    setImages={(images) => {
                        setComponents((previousComponents) =>
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
                    component={component}
                    key={component.id}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    components={component.components}
                    setComponents={(childComponents) => {
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIContainerComponent),
                                components: childComponents,
                            })),
                        );
                    }}
                    color={component.accent_color ?? null}
                    setColor={(color) => {
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIContainerComponent),
                                accent_color: color,
                            })),
                        );
                    }}
                />
            );
        } else if (component.type === ComponentType.ActionRow) {
            return (
                <ButtonGroup
                    key={component.id}
                    component={component}
                    components={component.components as APIButtonComponent[]}
                    setComponents={(components) => {
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIActionRowComponent<APIButtonComponent>),
                                components: components,
                            })),
                        );
                    }}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                />
            );
        } else if (component.type === ComponentType.File) {
            return (
                <File
                    key={component.id}
                    component={component}
                    onMoveUp={() => handleMove(index, "up")}
                    onMoveDown={() => handleMove(index, "down")}
                    onRemove={() => handleRemove(index)}
                    spoiler={component.spoiler ?? false}
                    onChangeSpoiler={(value) => {
                        setComponents((previousComponents) =>
                            updateAt(previousComponents, index, (old) => ({
                                ...(old as APIFileComponent),
                                spoiler: value,
                            })),
                        );
                    }}
                    file={component}
                    setFile={(file) => {
                        setComponents((previousComponents) =>
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
