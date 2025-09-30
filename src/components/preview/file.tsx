import type { APIFileComponent } from "discord-api-types/v10";
import FileIcon from "./icons/file";

export default function PreviewFile({ component }: { component: APIFileComponent }) {
    const name = () =>
        component.file.url.length === 0 ? "Untitled" : component.file.url.split("/").pop();

    const className = "text-[#7bb0f5] hover:underline cursor-pointer text-[16px]";

    return (
        <div className="bg-white/2.5 border border-white/7.5 rounded-[8px] p-4 w-md flex items-center gap-2">
            <FileIcon />
            <div className="flex flex-col">
                {component.file.url.startsWith("attachment://") ? (
                    <span className={className}>{name()}</span>
                ) : (
                    <a
                        href={component.file.url}
                        className={className}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {name()}
                    </a>
                )}
                <span className="text-[#adaeb4] text-xs">69.25 KB</span>
            </div>
        </div>
    );
}
