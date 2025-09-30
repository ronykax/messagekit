import {
    type APIActionRowComponent,
    type APIComponentInMessageActionRow,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import PreviewButton from "./button";

export default function PreviewButtonGroup({
    component,
    container,
}: {
    component: APIActionRowComponent<APIComponentInMessageActionRow>;
    container?: boolean;
}) {
    return (
        <div className="flex gap-[8px]">
            {component.components
                .filter(
                    (child) =>
                        child.type === ComponentType.Button && child.style !== ButtonStyle.Premium,
                )
                .map((child) => {
                    return (
                        <PreviewButton
                            container={container}
                            button={child}
                            key={`${child.type}-${child.id}`}
                        />
                    );
                })}
        </div>
    );
}
