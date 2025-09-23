import {
    type APIActionRowComponent,
    type APIComponentInMessageActionRow,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import { useHoveredComponentStore } from "@/lib/stores/hoveredComponent";
import { cn } from "@/lib/utils";
import { inspectedStyle } from "@/utils/constants";
import PreviewButton from "./button";

export default function PreviewButtonGroup({
    component,
    container,
}: {
    component: APIActionRowComponent<APIComponentInMessageActionRow>;
    container?: boolean;
}) {
    const { hoveredComponent } = useHoveredComponentStore();

    return (
        <div className={cn("flex gap-[8px]", hoveredComponent === component.id && inspectedStyle)}>
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
