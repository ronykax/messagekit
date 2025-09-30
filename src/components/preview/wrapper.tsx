import { type APIMessageTopLevelComponent, ComponentType } from "discord-api-types/v10";
import { useEffect } from "react";
import PreviewButtonGroup from "./button-group";
import PreviewContainer from "./container";
import PreviewFile from "./file";
import PreviewMediaGallery from "./media-gallery";
import PreviewSeparator from "./separator";
import PreviewTextDisplay from "./text-display";

export default function PreviewWrapper({ items }: { items: APIMessageTopLevelComponent[] }) {
    useEffect(() => {
        setTimeout(() => {
            localStorage.setItem("output-json", JSON.stringify(items));
        }, 1000);
    }, [items]);

    return (
        <div className="p-6 whitespace-pre-wrap bg-[#1a1a1e] flex flex-col h-full gap-2 overflow-y-auto">
            {items.map((component) => {
                if (component.type === ComponentType.TextDisplay) {
                    return <PreviewTextDisplay key={component.id} component={component} />;
                } else if (component.type === ComponentType.Section) {
                    return <PreviewTextDisplay key={component.id} component={component} />;
                } else if (component.type === ComponentType.MediaGallery) {
                    return <PreviewMediaGallery key={component.id} component={component} />;
                } else if (component.type === ComponentType.Separator) {
                    return <PreviewSeparator key={component.id} component={component} />;
                } else if (component.type === ComponentType.ActionRow) {
                    return <PreviewButtonGroup key={component.id} component={component} />;
                } else if (component.type === ComponentType.Container) {
                    return <PreviewContainer key={component.id} component={component} />;
                } else if (component.type === ComponentType.File) {
                    return <PreviewFile key={component.id} component={component} />;
                }
                return null;
            })}
        </div>
    );
}
