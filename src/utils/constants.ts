import {
    type APIActionRowComponent,
    type APIButtonComponent,
    type APIContainerComponent,
    type APIFileComponent,
    type APIMediaGalleryComponent,
    type APISeparatorComponent,
    type APIStringSelectComponent,
    type APITextDisplayComponent,
    ComponentType,
    SeparatorSpacingSize,
} from "discord-api-types/v10";
import {
    BoxIcon,
    FileIcon,
    ImageIcon,
    MousePointerClickIcon,
    SeparatorHorizontalIcon,
    SquareChevronDownIcon,
    TextIcon,
} from "lucide-react";
import type { MotionProps } from "motion/react";
import { randomNumber } from "./functions";

export const motionProps: MotionProps = {
    layout: "position",
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.1 },
};

export const defaultComponents = [];

export const componentDescriptors = [
    {
        name: "Text",
        type: ComponentType.TextDisplay,
        icon: TextIcon,
        create: (): APITextDisplayComponent => ({
            id: randomNumber(),
            type: ComponentType.TextDisplay,
            content: "",
        }),
        disabled: false,
    },
    {
        name: "Media",
        type: ComponentType.MediaGallery,
        icon: ImageIcon,
        create: (): APIMediaGalleryComponent => ({
            id: randomNumber(),
            type: ComponentType.MediaGallery,
            items: [],
        }),
        disabled: false,
    },
    {
        name: "File",
        type: ComponentType.File,
        icon: FileIcon,
        create: (): APIFileComponent => ({
            id: randomNumber(),
            type: ComponentType.File,
            file: { url: "" },
        }),
        disabled: false,
    },
    {
        name: "Container",
        type: ComponentType.Container,
        icon: BoxIcon,
        create: (): APIContainerComponent => ({
            id: randomNumber(),
            type: ComponentType.Container,
            components: [],
        }),
        disabled: false,
    },
    {
        name: "Separator",
        type: ComponentType.Separator,
        icon: SeparatorHorizontalIcon,
        create: (): APISeparatorComponent => ({
            id: randomNumber(),
            type: ComponentType.Separator,
            spacing: SeparatorSpacingSize.Small,
            divider: true,
        }),
        disabled: false,
    },
    {
        name: "Buttons",
        type: ComponentType.ActionRow,
        icon: MousePointerClickIcon,
        create: (): APIActionRowComponent<APIButtonComponent> => ({
            id: randomNumber(),
            type: ComponentType.ActionRow,
            components: [],
        }),
        disabled: false,
    },
    {
        name: "Select",
        type: ComponentType.ActionRow,
        icon: SquareChevronDownIcon,
        create: (): APIActionRowComponent<APIStringSelectComponent> => ({
            id: randomNumber(),
            type: ComponentType.ActionRow,
            components: [],
        }),
        disabled: true,
    },
] as const;

export const inspectedStyle = "ring-1 ring-destructive animate-pulse [animation-duration:0.75s]";
