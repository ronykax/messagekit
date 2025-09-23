import {
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    ButtonStyle,
    CDNRoutes,
    ImageFormat,
    RouteBases,
} from "discord-api-types/v10";
import Twemoji from "react-twemoji";
import { cn } from "@/lib/utils";
import ExternalLinkIcon from "./icons/external-link";

export default function PreviewButton({
    button,
    container,
}: {
    button: APIButtonComponentWithCustomId | APIButtonComponentWithURL;
    container?: boolean;
}) {
    const topLevelStyle =
        button.style === ButtonStyle.Primary
            ? "bg-primary hover:bg-[#4654c0]"
            : button.style === ButtonStyle.Secondary
              ? "bg-[#3e3f45] hover:bg-[#46474e]"
              : button.style === ButtonStyle.Success
                ? "bg-[#00863a] hover:bg-[#047e37]"
                : button.style === ButtonStyle.Danger
                  ? "bg-[#d22d39] hover:bg-[#b42831]"
                  : button.style === ButtonStyle.Link
                    ? "bg-[#3e3f45] hover:bg-[#46474e]"
                    : "";

    const containerStyle =
        button.style === ButtonStyle.Primary
            ? "bg-primary hover:bg-[#4654c0]"
            : button.style === ButtonStyle.Secondary
              ? "bg-[#44454c] hover:bg-[#4c4c54]"
              : button.style === ButtonStyle.Success
                ? "bg-[#00863a] hover:bg-[#047e37]"
                : button.style === ButtonStyle.Danger
                  ? "bg-[#d22d39] hover:bg-[#b42831]"
                  : button.style === ButtonStyle.Link
                    ? "bg-[#44454c] hover:bg-[#4c4c54]"
                    : "";

    const parentClassName = cn(
        "flex items-center px-[11px] h-[32px] rounded-[8px] duration-150 cursor-pointer text-nowrap",
        container ? containerStyle : topLevelStyle,
    );

    function Label() {
        return (
            <span
                className={cn(
                    "my-auto text-center text-[14px] font-medium leading-[18px]",
                    !button.emoji && "min-w-[32px]",
                )}
            >
                {button.label}
            </span>
        );
    }

    function Emoji() {
        return button.emoji?.id ? (
            // biome-ignore lint/performance/noImgElement: i love goth mommy
            <img
                className="size-[19.250px] mr-[4px]"
                src={
                    RouteBases.cdn +
                    CDNRoutes.emoji(
                        button.emoji.id,
                        button.emoji.animated ? ImageFormat.GIF : ImageFormat.WebP,
                    )
                }
                alt="emojii"
                width={32}
                height={32}
            />
        ) : (
            <Twemoji options={{ className: "size-[19.250px] mr-[4px]" }}>
                {button.emoji?.name}
            </Twemoji>
        );
    }

    return button.style === ButtonStyle.Link ? (
        <a href={button.url} className={parentClassName} target="_blank" rel="noreferrer">
            <Emoji />
            <Label />
            <span className="ml-[8px] my-auto">
                <ExternalLinkIcon />
            </span>
        </a>
    ) : (
        <button type="button" className={parentClassName}>
            <Emoji />
            <Label />
        </button>
    );
}
