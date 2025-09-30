import { HashIcon } from "lucide-react";
import {
    Children,
    cloneElement,
    Fragment,
    isValidElement,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
} from "react";
import { randomNumber } from "@/utils/functions";

function Mention({ icon, text }: { icon?: ReactNode; text: string }) {
    return (
        <span className="bg-primary/50 px-1 rounded-[4px] inline-flex items-center font-medium hover:bg-primary hover:text-white duration-150 cursor-pointer">
            {icon && icon}
            {text}
        </span>
    );
}

export function renderNodesWithMentions(node: ReactNode): ReactNode {
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
            <Fragment>{renderNodesWithMentions(child as ReactNode)}</Fragment>
        ));
    }

    if (isValidElement(node)) {
        const element = node as ReactElement<PropsWithChildren>;
        const childNodes = element.props.children;
        return cloneElement(element, undefined, renderNodesWithMentions(childNodes));
    }

    return node;
}
