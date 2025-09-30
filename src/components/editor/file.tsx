import type { APIFileComponent } from "discord-api-types/v10";
import { FileIcon } from "lucide-react";
import { sanitizeFileName } from "@/utils/functions";
import { useFiles } from "@/utils/stores/files";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import Wrapper from "./wrapper";

export default function File({
    onMoveUp,
    onMoveDown,
    onRemove,
    onChangeSpoiler,
    spoiler,
    file,
    setFile,
}: {
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    onChangeSpoiler: (value: boolean) => void;
    spoiler: boolean;
    file: APIFileComponent;
    setFile: (file: APIFileComponent) => void;
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
        <Wrapper
            name="File"
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
        </Wrapper>
    );
}
