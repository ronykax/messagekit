import {
    type APISectionComponent,
    type APITextDisplayComponent,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import { HashIcon } from "lucide-react";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { Children, cloneElement, Fragment, isValidElement } from "react";
import { parseTokens, randomNumber, tokenize } from "@/utils/functions";
import PreviewButton from "./button";
import { MarkdownRenderer } from "./renderer";

function Mention({ icon, text }: { icon?: ReactNode; text: string }) {
    return (
        <span className="bg-primary/50 px-1 rounded-[4px] inline-flex items-center font-medium hover:bg-primary hover:text-white duration-150 cursor-pointer">
            {icon && icon}
            {text}
        </span>
    );
}

function _renderNodesWithMentions(node: ReactNode): ReactNode {
    if (typeof node === "string") {
        const parts = node.split(/(<@&\d+>|<@\d+>|<#\d+>|@everyone|@here)/g);

        return parts.map((part, i) => {
            const userMatch = part.match(/^<@(\d+)>$/);
            if (userMatch) return <Mention key={`m-u-${i}-${userMatch[1]}`} text={"@User"} />;

            const channelMatch = part.match(/^<#(\d+)>$/);
            if (channelMatch)
                return (
                    <Mention
                        key={`m-c-${i}-${channelMatch[1]}`}
                        icon={<HashIcon className="size-4 mr-1" />}
                        text={"channel"}
                    />
                );

            const roleMatch = part.match(/^<@&(\d+)>$/);
            if (roleMatch) return <Mention key={`m-r-${i}-${roleMatch[1]}`} text={"@Role"} />;

            if (part === "@everyone") return <Mention key={randomNumber()} text="@everyone" />;
            if (part === "@here") return <Mention key={randomNumber()} text="@here" />;

            return part;
        });
    }

    if (Array.isArray(node)) {
        return Children.map(node, (child) => (
            <Fragment>{_renderNodesWithMentions(child as ReactNode)}</Fragment>
        ));
    }

    if (isValidElement(node)) {
        const element = node as ReactElement<PropsWithChildren>;
        const childNodes = element.props.children;
        return cloneElement(element, undefined, _renderNodesWithMentions(childNodes));
    }

    return node;
}

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
