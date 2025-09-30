import { type APIContainerComponent, ComponentType } from "discord-api-types/v10";
import { numberToHex } from "@/utils/functions";
import PreviewButtonGroup from "./button-group";
import PreviewFile from "./file";
import PreviewMediaGallery from "./media-gallery";
import PreviewSeparator from "./separator";
import PreviewTextDisplay from "./text-display";

export default function PreviewContainer({
    component: comp,
}: {
    component: APIContainerComponent;
}) {
    return (
        <div className="flex border-white/7.5 border rounded-md w-fit overflow-hidden max-w-[598px]">
            {comp.accent_color && (
                <div
                    className="min-w-1 max-w-1"
                    style={{ backgroundColor: numberToHex(comp.accent_color) }}
                />
            )}
            <div className="flex flex-col gap-2 bg-white/2.5 text-sm" style={{ padding: "16px" }}>
                {comp.components.map((component) => {
                    if (component.type === ComponentType.TextDisplay) {
                        return (
                            <PreviewTextDisplay
                                container
                                key={component.id}
                                component={component}
                            />
                        );
                    } else if (component.type === ComponentType.Section) {
                        return (
                            <PreviewTextDisplay
                                container
                                key={component.id}
                                component={component}
                            />
                        );
                    } else if (component.type === ComponentType.MediaGallery) {
                        return (
                            <PreviewMediaGallery
                                container
                                key={component.id}
                                component={component}
                            />
                        );
                    } else if (component.type === ComponentType.Separator) {
                        return <PreviewSeparator key={component.id} component={component} />;
                    } else if (component.type === ComponentType.ActionRow) {
                        return (
                            <PreviewButtonGroup
                                container
                                key={component.id}
                                component={component}
                            />
                        );
                    } else if (component.type === ComponentType.File) {
                        return <PreviewFile key={component.id} component={component} />;
                    } else return null;
                })}
            </div>
        </div>
    );
}
