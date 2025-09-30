import {
    type APIActionRowComponent,
    type APIButtonComponent,
    type APIContainerComponent,
    type APIFileComponent,
    type APIMediaGalleryComponent,
    type APIMessageTopLevelComponent,
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
import { BotActions } from "./types";

export const motionProps: MotionProps = {
    layout: "position",
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.1 },
};

export const defaultComponents: APIMessageTopLevelComponent[] = [
    {
        id: 500528667,
        type: 10,
        content:
            "# Create modular, interactive messages\nBuild interactive messages with a simple editor, live preview, and flexible sending options so you can focus on what you're saying, not how to format it.",
    },
    {
        id: 869213619,
        type: 17,
        components: [
            {
                id: 843217988,
                type: 12,
                items: [
                    {
                        media: {
                            url: "https://messagekit.app/example-header.png",
                        },
                        description: "header image",
                    },
                ],
            },
            {
                id: 280096184,
                type: 10,
                content:
                    "# Getting started\n- Install Message Kit in your server.\n- Click **Add Item** at the top of this panel and choose one.\n- Customize the component as you like.\n- Send it! You can send your message via our bot or with webhooks.",
            },
        ],
        accent_color: 5727743,
    },
    {
        id: 724873915,
        type: 1,
        components: [
            {
                id: 277957816,
                type: 2,
                label: "Support Server",
                style: 5,
                url: "https://discord.gg/5bBM2TVDD3",
            },
            {
                id: 172033159,
                type: 2,
                label: "Donate",
                style: 5,
                url: "https://ko-fi.com/ronykax",
            },
        ],
    },
];

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

export const actionOptions = [
    { label: "Send to channel", type: BotActions.SendToChannel },
    { label: "Reply to interaction", type: BotActions.ReplyToInteraction },
    { label: "Do nothing", type: BotActions.DoNothing },
];
