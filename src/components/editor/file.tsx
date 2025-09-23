import type { APIFileComponent } from "discord-api-types/v10";
import { FileIcon } from "lucide-react";
import { useFiles } from "@/lib/stores/files";
import { sanitizeFileName } from "@/utils/functions";
import NewBuilder from "../new-builder";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function File({
    onMoveUp,
    onMoveDown,
    onRemove,
    onChangeSpoiler,
    spoiler,
    file,
    setFile,
    component,
}: {
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    onChangeSpoiler: (value: boolean) => void;
    spoiler: boolean;
    file: APIFileComponent;
    setFile: (file: APIFileComponent) => void;
    component: APIFileComponent;
}) {
    const { files, setFiles } = useFiles();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFile = e.target.files?.[0];
        if (!inputFile) return;

        if (inputFile) {
            setFiles([...files, inputFile]);
            setFile({
                ...file,
                file: { url: `attachment://${sanitizeFileName(inputFile.name)}` },
            });
        }
    };

    return (
        <NewBuilder
            name="File"
            tag={component.id ?? null}
            icon={<FileIcon />}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
            extraButton={
                <>
                    <div className="flex gap-2 items-center">
                        <Label
                            className="text-xs text-muted-foreground font-semibold"
                            htmlFor="show-spoiler"
                        >
                            Spoiler
                        </Label>
                        <Switch
                            onCheckedChange={onChangeSpoiler}
                            checked={spoiler}
                            id="show-spoiler"
                        />
                    </div>
                    <div />
                </>
            }
        >
            <Input type="file" onChange={handleFileUpload} />
        </NewBuilder>
    );
}
