import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, TrashIcon } from "lucide-react";
import { motion } from "motion/react";
import { type PropsWithChildren, type ReactNode, useEffect, useState } from "react";
import { useHoveredComponentStore } from "@/lib/stores/hoveredComponent";
import { useInspectingStore } from "@/lib/stores/inspecting";
import { cn } from "@/lib/utils";
import { motionProps } from "@/utils/constants";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface Props extends PropsWithChildren {
    name: string;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    extraButton?: React.ReactNode;
    helperText?: string;
    className?: string;
    style?: React.CSSProperties;
    tag: number | null;
    icon?: ReactNode;
}

export default function NewBuilder({
    name,
    onMoveUp,
    onMoveDown,
    onRemove,
    extraButton,
    helperText,
    children,
    className,
    style,
    tag,
    icon,
}: Props) {
    const [collapsed, setCollapsed] = useState(false);
    const { setHoveredComponent } = useHoveredComponentStore();
    const { inspecting } = useInspectingStore();

    useEffect(() => {
        if (name === "Separator") {
            setCollapsed(true);
        }
    }, [name]);

    return (
        <motion.div {...motionProps}>
            {/** biome-ignore lint/a11y/noStaticElementInteractions: no */}
            <div
                className={cn(
                    "flex flex-col border rounded-xl bg-card",
                    className,
                    name !== "Container" && inspecting && "hover:ring-1 hover:ring-destructive",
                )}
                style={style}
                onMouseEnter={() => {
                    if (!inspecting) return;
                    setHoveredComponent(tag ?? null);
                }}
                onMouseLeave={() => {
                    if (!inspecting) return;
                    setHoveredComponent(null);
                }}
            >
                <div className="flex justify-between items-center gap-2 p-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            className="size-7 group"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? (
                                <ChevronRightIcon className="hidden group-hover:block" />
                            ) : (
                                <ChevronDownIcon className="hidden group-hover:block" />
                            )}
                            <span className="block group-hover:hidden text-muted-foreground">
                                {icon}
                            </span>
                        </Button>
                        <span className="font-medium text-sm -ml-1">{name}</span>
                        {helperText && (
                            <span className="text-xs text-muted-foreground mt-1 font-medium hidden md:block">
                                {helperText}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5">
                        {extraButton}
                        <Button className="size-7" variant="ghost" onClick={onMoveUp}>
                            <ChevronUpIcon />
                        </Button>
                        <Button className="size-7" variant="ghost" onClick={onMoveDown}>
                            <ChevronDownIcon />
                        </Button>
                        <Button className="size-7" variant="ghost" onClick={onRemove}>
                            <TrashIcon />
                        </Button>
                    </div>
                </div>
                {!collapsed && (
                    <>
                        <Separator />
                        <div className="p-4">{children}</div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
