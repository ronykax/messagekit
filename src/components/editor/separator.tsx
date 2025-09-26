import { SeparatorSpacingSize } from "discord-api-types/v10";
import { SeparatorHorizontalIcon } from "lucide-react";
import NewBuilder from "../new-builder";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export default function Separator({
    onMoveUp,
    onMoveDown,
    onRemove,
    spacing,
    divider,
    onChangeSpacing,
    onChangeDivider,
}: {
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    spacing: SeparatorSpacingSize;
    divider: boolean;
    onChangeSpacing: (size: SeparatorSpacingSize) => void;
    onChangeDivider: (value: boolean) => void;
}) {
    return (
        <NewBuilder
            name="Separator"
            icon={<SeparatorHorizontalIcon />}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            extraButton={
                <>
                    <div className="flex gap-2 items-center">
                        <Label className="h-7 text-xs font-medium" htmlFor="show-divider">
                            Show Divider
                        </Label>
                        <Switch
                            onCheckedChange={onChangeDivider}
                            checked={divider}
                            id="show-divider"
                        />
                    </div>
                    <div />
                </>
            }
        >
            <Tabs
                defaultValue={spacing === SeparatorSpacingSize.Large ? "large" : "small"}
                onValueChange={(value) => {
                    if (value === "large") {
                        onChangeSpacing(SeparatorSpacingSize.Large);
                    } else {
                        onChangeSpacing(SeparatorSpacingSize.Small);
                    }
                }}
            >
                <TabsList className="w-full">
                    <TabsTrigger value="large">Large</TabsTrigger>
                    <TabsTrigger value="small">Small</TabsTrigger>
                </TabsList>
            </Tabs>
        </NewBuilder>
    );
}
