import { type APISeparatorComponent, SeparatorSpacingSize } from "discord-api-types/v10";
import { useHoveredComponentStore } from "@/lib/stores/hoveredComponent";
import { cn } from "@/lib/utils";
import { inspectedStyle } from "@/utils/constants";

export default function PreviewSeparator({ component }: { component: APISeparatorComponent }) {
    const { hoveredComponent } = useHoveredComponentStore();

    return (
        <div
            className={cn(
                "h-[1px] bg-[#46474e]",
                component.spacing === SeparatorSpacingSize.Large ? "my-[8px]" : "my-[0px]",
                component.divider ? "bg-[#46474e]" : "bg-transparent",
                hoveredComponent === component.id && inspectedStyle,
            )}
        />
    );
}
