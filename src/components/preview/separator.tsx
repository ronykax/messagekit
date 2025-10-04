import { type APISeparatorComponent, SeparatorSpacingSize } from "discord-api-types/v10";
import { cn } from "@/lib/utils";

export default function PreviewSeparator({ component }: { component: APISeparatorComponent }) {
    return (
        <div
            className={cn(
                "h-[1px]",
                component.spacing === SeparatorSpacingSize.Large ? "my-[8px]" : "my-[0px]",
                component.divider ? "bg-white/7.5" : "bg-transparent",
            )}
        />
    );
}
