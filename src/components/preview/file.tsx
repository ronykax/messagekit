import type { APIFileComponent } from "discord-api-types/v10";
import FileIcon from "./icons/file";

export default function PreviewFile({ component }: { component: APIFileComponent }) {
    const name = () =>
        component.file.url.length === 0 ? "Untitled" : component.file.url.split("/").pop();
    const className = "text-[#7bb0f5] hover:underline cursor-pointer text-[16px] leading-none";

    return (
        <div className="bg-[#393a41] border border-[#44454c] rounded-[8px] p-[16px] w-[432px] flex items-center gap-[8px] shadow-md">
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
                <span className="text-[#adaeb4] text-[12px]">69.25 KB</span>
            </div>
        </div>
    );
}
