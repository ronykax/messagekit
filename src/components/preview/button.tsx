import {
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    ButtonStyle,
    CDNRoutes,
    ImageFormat,
    RouteBases,
} from "discord-api-types/v10";
import { ExternalLinkIcon } from "lucide-react";
import Twemoji from "react-twemoji";
import { cn } from "@/lib/utils";
// import ExternalLinkIcon from "./icons/external-link";

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
              ? "bg-[#29292d] hover:bg-[#3b3b40]"
              : button.style === ButtonStyle.Success
                ? "bg-[#00863a] hover:bg-[#047e37]"
                : button.style === ButtonStyle.Danger
                  ? "bg-[#d22d39] hover:bg-[#b42831]"
                  : button.style === ButtonStyle.Link
                    ? "bg-[#29292d] hover:bg-[#3b3b40]"
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
        "flex items-center px-4 py-2 rounded-md duration-150 cursor-pointer text-nowrap h-fit",
        container ? containerStyle : topLevelStyle,
    );

    function Label() {
        return <span className="my-auto text-center text-sm font-medium">{button.label}</span>;
    }

    function Emoji() {
        return button.emoji?.id ? (
            <img
                className="size-5 mr-1"
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
            <Twemoji options={{ className: "size-5 mr-1" }}>{button.emoji?.name}</Twemoji>
        );
    }

    return button.style === ButtonStyle.Link ? (
        <a href={button.url} className={parentClassName} target="_blank" rel="noreferrer">
            <Emoji />
            <Label />
            <span className="ml-[8px] my-auto">
                <ExternalLinkIcon className="size-4" />
            </span>
        </a>
    ) : (
        <button type="button" className={parentClassName}>
            <Emoji />
            <Label />
        </button>
    );
}
