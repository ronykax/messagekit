import {
    type APIButtonComponent,
    type APIButtonComponentWithURL,
    type APIEmoji,
    type APIGuild,
    type APISectionAccessoryComponent,
    type APIThumbnailComponent,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import {
    CheckIcon,
    ImageIcon,
    MousePointerClickIcon,
    PlusIcon,
    TextIcon,
    TrashIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toComponentEmoji } from "@/utils/functions";
import EmojiPicker from "../emoji-picker";
import HelperText from "../helper-text";
import ActionSelector from "../select/actions";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import Wrapper from "./wrapper";

export default function TextDisplay({
    content,
    onContentChange,
    onMoveUp,
    onMoveDown,
    onRemove,
    accessory,
    setAccessory,
    removeAccessory,
    guild,
    messageId,
}: {
    content: string;
    onContentChange: (content: string) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    accessory?: APISectionAccessoryComponent;
    setAccessory?: (accessory: APISectionAccessoryComponent) => void;
    removeAccessory?: () => void;
    guild: APIGuild;
    messageId: string;
}) {
    const [tab, setTab] = useState<"thumbnail" | "button">(
        accessory?.type === ComponentType.Button ? "button" : "thumbnail",
    );

    // image accesory
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    // button accesory
    const [buttonLabel, setButtonLabel] = useState("");
    const [buttonEmoji, setButtonEmoji] = useState<string | APIEmoji | null>(null);
    const [buttonStyle, setButtonStyle] = useState<
        "primary" | "secondary" | "success" | "danger" | "link"
    >("primary");
    const [buttonUrl, setButtonUrl] = useState("");
    const [buttonActionId, setButtonActionId] = useState("");

    const isValid = useMemo(() => {
        if (tab === "thumbnail") {
            if (!imageUrl.trim()) return false;
            try {
                new URL(imageUrl);
                return true;
            } catch {
                return false;
            }
        }

        if (tab === "button") {
            if (!buttonLabel.trim()) return false;
            if (buttonStyle === "link") {
                try {
                    new URL(buttonUrl);
                    return true;
                } catch {
                    return false;
                }
            } else {
                return buttonActionId.trim().length > 0;
            }
        }

        return false;
    }, [imageUrl, buttonLabel, buttonStyle, buttonUrl, buttonActionId, tab]);

    function resetAllStates() {
        setImageUrl("");
        setImageAlt("");

        setButtonLabel("");
        setButtonEmoji(null);
        setButtonStyle("primary");

        setButtonUrl("");
        setButtonActionId("");
    }

    function isThumbnailComponent(
        a: APISectionAccessoryComponent | undefined,
    ): a is APIThumbnailComponent {
        return !!a && a.type === ComponentType.Thumbnail;
    }

    function isButtonComponent(
        a: APISectionAccessoryComponent | undefined,
    ): a is APIButtonComponent {
        return !!a && a.type === ComponentType.Button;
    }

    function isButtonWithURL(
        a: APISectionAccessoryComponent | undefined,
    ): a is APIButtonComponentWithURL {
        return isButtonComponent(a) && a.style === ButtonStyle.Link;
    }

    function buttonTypeToButtonStyle(type: string) {
        switch (type) {
            case "link":
                return ButtonStyle.Link;
            case "secondary":
                return ButtonStyle.Secondary;
            case "success":
                return ButtonStyle.Success;
            case "danger":
                return ButtonStyle.Danger;
            default:
                return ButtonStyle.Primary;
        }
    }

    function buttonStyleToButtonType(style: ButtonStyle) {
        switch (style) {
            case ButtonStyle.Link:
                return "link";
            case ButtonStyle.Secondary:
                return "secondary";
            case ButtonStyle.Success:
                return "success";
            case ButtonStyle.Danger:
                return "danger";
            default:
                return "primary";
        }
    }

    const imageUrlValue = isThumbnailComponent(accessory) ? accessory.media.url : imageUrl;
    const imageAltValue = isThumbnailComponent(accessory)
        ? (accessory.description ?? "")
        : imageAlt;
    const buttonStyleValue = isButtonComponent(accessory)
        ? buttonStyleToButtonType(accessory.style)
        : buttonStyle;
    const buttonUrlValue = isButtonWithURL(accessory) ? accessory.url : buttonUrl;

    return (
        <Wrapper
            name="Text"
            icon={<TextIcon />}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            helperText={`(${content.length}/4000)`}
            extraButton={
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={"ghost"} size={"sm"} className="h-7 text-xs font-medium">
                            <PlusIcon />
                            {accessory?.type ? "Edit" : "Set"} Accessory
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Accessory</DialogTitle>
                            <DialogDescription>
                                Set the accessory for the text display.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs
                            defaultValue={
                                accessory && accessory.type === ComponentType.Thumbnail
                                    ? "thumbnail"
                                    : accessory && accessory.type === ComponentType.Button
                                      ? "button"
                                      : "balls"
                            }
                            onValueChange={(value) => setTab(value as "thumbnail" | "button")}
                        >
                            <TabsList className="mb-3 w-full">
                                <TabsTrigger value="thumbnail">
                                    <ImageIcon />
                                    Thumbnail
                                </TabsTrigger>
                                <TabsTrigger value="button">
                                    <MousePointerClickIcon />
                                    Button
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="thumbnail" className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="image-url">
                                        Image
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="image-url"
                                        placeholder="https://example.com/image.png"
                                        value={imageUrlValue}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="image-alt">Description (Alt Text)</Label>
                                    <Input
                                        id="image-alt"
                                        placeholder="Add a description"
                                        value={imageAltValue}
                                        onChange={(e) => setImageAlt(e.target.value)}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="button" className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="btn-label">
                                        Label
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="btn-label"
                                            placeholder="Enter your label"
                                            value={buttonLabel}
                                            onChange={(e) => setButtonLabel(e.target.value)}
                                        />
                                        <EmojiPicker
                                            setEmoji={(emoji) => {
                                                if (typeof emoji === "string") {
                                                    setButtonEmoji(emoji);
                                                } else if (emoji !== null) {
                                                    setButtonEmoji({
                                                        id: emoji.id,
                                                        name: emoji.name,
                                                    });
                                                } else {
                                                    setButtonEmoji(null);
                                                }
                                            }}
                                            emoji={buttonEmoji}
                                            guild={guild}
                                        />
                                    </div>
                                </div>
                                <RadioGroup
                                    // change this to value if there's error
                                    defaultValue={buttonStyleValue}
                                    onValueChange={(v) => setButtonStyle(v as typeof buttonStyle)}
                                >
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="primary" id="r1" />
                                        <Label htmlFor="r1">Primary</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="secondary" id="r2" />
                                        <Label htmlFor="r2">Secondary</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="success" id="r3" />
                                        <Label htmlFor="r3">Success</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="danger" id="r4" />
                                        <Label htmlFor="r4">Danger</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="link" id="r5" />
                                        <Label htmlFor="r5">Link</Label>
                                    </div>
                                </RadioGroup>

                                {/* show url input if style is link, otherwise show action id input */}
                                {buttonStyle === "link" ? (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="btn-url">
                                            URL
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="btn-url"
                                            placeholder="Enter your URL"
                                            value={buttonUrlValue}
                                            onChange={(e) => setButtonUrl(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="btn-action-id">
                                            Action
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <ActionSelector
                                            setAction={(action) =>
                                                setButtonActionId(JSON.stringify(action.params))
                                            }
                                            action={buttonActionId}
                                            disabled={messageId === "new"}
                                            messageId={messageId}
                                        />
                                        <HelperText text="Select an action that this button should trigger" />
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                        {/* 50ms for the dialog close animation to complete */}
                        <DialogFooter>
                            {accessory && (
                                <DialogClose asChild>
                                    <Button
                                        variant={"destructive"}
                                        onClick={() =>
                                            setTimeout(() => {
                                                removeAccessory?.();
                                                resetAllStates();
                                            }, 50)
                                        }
                                    >
                                        <TrashIcon />
                                        Remove
                                    </Button>
                                </DialogClose>
                            )}
                            <DialogClose asChild>
                                <Button
                                    onClick={() => {
                                        if (tab === "thumbnail") {
                                            setAccessory?.({
                                                type: ComponentType.Thumbnail,
                                                media: { url: imageUrl },
                                                description: imageAlt,
                                            });
                                        } else if (tab === "button") {
                                            const style = buttonTypeToButtonStyle(buttonStyle);
                                            if (style === ButtonStyle.Link) {
                                                setAccessory?.({
                                                    type: ComponentType.Button,
                                                    label: buttonLabel,
                                                    style: style,
                                                    url: buttonUrl,
                                                    emoji: toComponentEmoji(buttonEmoji),
                                                });
                                            } else {
                                                setAccessory?.({
                                                    type: ComponentType.Button,
                                                    label: buttonLabel,
                                                    style: style,
                                                    custom_id: buttonActionId,
                                                    emoji: toComponentEmoji(buttonEmoji),
                                                });
                                            }
                                        }
                                    }}
                                    disabled={!isValid}
                                >
                                    <CheckIcon />
                                    Save
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
        >
            <Textarea
                placeholder="The quick brown fox jumps over the lazy dog"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="border-accent"
            />
            {/* <div className="rounded-md border mt-4 text-sm">
                show gap
            </div> */}
        </Wrapper>
    );
}
