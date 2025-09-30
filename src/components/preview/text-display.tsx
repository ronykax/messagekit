import {
    type APISectionComponent,
    type APITextDisplayComponent,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import { parseTokens, tokenize } from "@/utils/functions";
import PreviewButton from "./button";
import { MarkdownRenderer } from "./renderer";

export default function PreviewTextDisplay({
    component,
}: {
    component: APITextDisplayComponent | APISectionComponent;
    container?: boolean;
}) {
    const content =
        component.type === ComponentType.TextDisplay
            ? component.content
            : component.components[0].content;

    const tokens = tokenize(content);
    const ast = parseTokens(tokens);

    return (
        <div className="flex gap-4 max-w-[700px]">
            <div className="flex flex-col gap-2">
                <MarkdownRenderer nodes={ast} />
            </div>
            {component.type === ComponentType.Section &&
                (component.accessory.type === ComponentType.Thumbnail ? (
                    <div className="rounded-md overflow-hidden size-[86px]">
                        {/** biome-ignore lint/performance/noImgElement: balls */}
                        <img
                            src={component.accessory.media.url}
                            alt={component.accessory.description ?? "image"}
                        />
                    </div>
                ) : component.accessory.type === ComponentType.Button ? (
                    component.accessory.style !== ButtonStyle.Premium && (
                        <PreviewButton button={component.accessory} />
                    )
                ) : null)}
        </div>
    );
}
