import type { APIMediaGalleryComponent } from "discord-api-types/v10";
import { memo, useEffect, useState } from "react";
import { useFiles } from "@/lib/stores/files";
import { cn } from "@/lib/utils";
import { sanitizeFileName } from "@/utils/functions";

type PreviewMediaTileProps = {
    mediaUrl: string;
    description?: string | null;
    aspect: "square" | "video" | "auto";
    spoiler: boolean | undefined;
    className?: string;
};

const PreviewMediaTile = memo(function PreviewMediaTile({
    mediaUrl,
    description,
    aspect,
    className,
    spoiler = false,
}: PreviewMediaTileProps) {
    const { files } = useFiles();
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (mediaUrl.startsWith("attachment://")) {
            const filename = mediaUrl.split("/").pop();
            const file = filename
                ? files.find((f) => sanitizeFileName(f.name) === filename)
                : undefined;

            if (file) {
                const objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
            }

            setUrl(null);
            return;
        }

        setUrl(mediaUrl);
    }, [mediaUrl, files]);

    if (!url) return null;

    return (
        <div
            className={`rounded-lg overflow-hidden relative ${aspect === "video" ? "aspect-video" : aspect === "square" ? "aspect-square" : ""} ${className ?? ""}`}
        >
            {/* biome-ignore lint/performance/noImgElement: image preview */}
            <img
                src={url}
                className={cn(
                    `${aspect === "auto" ? "w-full h-auto" : "size-full"} object-cover`,
                    spoiler && "blur-[44px]",
                )}
                alt={description ?? "image"}
                width={256}
                height={256}
            />
            <button
                className={cn(
                    "absolute size-full inset-0 bg-white/10 flex justify-center items-center group hover:bg-white/15 cursor-pointer duration-75",
                    spoiler ? "opacity-100" : "opacity-0",
                )}
                type="button"
            >
                <div className="px-[12px] py-[8px] leading-none rounded-full bg-[#00000099] text-[15px] font-semibold tracking-[0.5px] group-hover:bg-black">
                    SPOILER
                </div>
            </button>
        </div>
    );
});

export default function PreviewMediaGallery({
    component,
    container,
}: {
    component: APIMediaGalleryComponent;
    container?: boolean;
}) {
    const items = component.items;
    const count = items.length;

    if (count <= 0) return null;

    if (count === 1) {
        return (
            <div
                className="rounded-[8px] overflow-hidden"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <PreviewMediaTile
                    mediaUrl={items[0].media.url}
                    description={items[0].description}
                    aspect="auto"
                    spoiler={items[0].spoiler}
                />
            </div>
        );
    }

    if (count === 2) {
        return (
            <div
                className="rounded-[8px] overflow-hidden grid grid-cols-2 gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                {items.map((item, i) => (
                    <PreviewMediaTile
                        key={`${item.media.url}-${i}`}
                        mediaUrl={item.media.url}
                        description={item.description}
                        aspect="square"
                        spoiler={item.spoiler}
                    />
                ))}
            </div>
        );
    }

    if (count === 3) {
        return (
            <div
                className="rounded-[8px] overflow-hidden grid grid-cols-3 grid-rows-2 gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <div className="col-span-2 row-span-2">
                    <PreviewMediaTile
                        mediaUrl={items[0].media.url}
                        description={items[0].description}
                        aspect="square"
                        spoiler={items[0].spoiler}
                    />
                </div>
                <PreviewMediaTile
                    key={`${items[1].media.url}-1`}
                    mediaUrl={items[1].media.url}
                    description={items[1].description}
                    aspect="square"
                    spoiler={items[1].spoiler}
                />
                <PreviewMediaTile
                    key={`${items[2].media.url}-2`}
                    mediaUrl={items[2].media.url}
                    description={items[2].description}
                    aspect="square"
                    spoiler={items[2].spoiler}
                />
            </div>
        );
    }

    if (count === 4) {
        return (
            <div
                className="rounded-[8px] overflow-hidden grid grid-cols-2 gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                {items.map((item, i) => (
                    <PreviewMediaTile
                        key={`${item.media.url}-${i}`}
                        mediaUrl={item.media.url}
                        description={item.description}
                        aspect="video"
                        spoiler={item.spoiler}
                    />
                ))}
            </div>
        );
    }

    if (count === 5) {
        return (
            <div
                className="rounded-[8px] overflow-hidden flex flex-col gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <div className="grid grid-cols-2 gap-[4px]">
                    <PreviewMediaTile
                        key={`${items[0].media.url}-0`}
                        mediaUrl={items[0].media.url}
                        description={items[0].description}
                        aspect="square"
                        spoiler={items[0].spoiler}
                    />
                    <PreviewMediaTile
                        key={`${items[1].media.url}-1`}
                        mediaUrl={items[1].media.url}
                        description={items[1].description}
                        aspect="square"
                        spoiler={items[0].spoiler}
                    />
                </div>
                <div className="grid grid-cols-3 gap-[4px]">
                    <PreviewMediaTile
                        key={`${items[2].media.url}-2`}
                        mediaUrl={items[2].media.url}
                        description={items[2].description}
                        aspect="square"
                        spoiler={items[2].spoiler}
                    />
                    <PreviewMediaTile
                        key={`${items[3].media.url}-3`}
                        mediaUrl={items[3].media.url}
                        description={items[3].description}
                        aspect="square"
                        spoiler={items[3].spoiler}
                    />
                    <PreviewMediaTile
                        key={`${items[4].media.url}-4`}
                        mediaUrl={items[4].media.url}
                        description={items[4].description}
                        aspect="square"
                        spoiler={items[4].spoiler}
                    />
                </div>
            </div>
        );
    }

    if (count === 6) {
        return (
            <div
                className="rounded-[8px] overflow-hidden grid grid-cols-3 gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                {items.map((item, i) => (
                    <PreviewMediaTile
                        key={`${item.media.url}-${i}`}
                        mediaUrl={item.media.url}
                        description={item.description}
                        aspect="square"
                        spoiler={item.spoiler}
                    />
                ))}
            </div>
        );
    }

    if (count === 7) {
        return (
            <div
                className="rounded-[8px] overflow-hidden flex flex-col gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <PreviewMediaTile
                    key={`${items[0].media.url}-0`}
                    mediaUrl={items[0].media.url}
                    description={items[0].description}
                    aspect="video"
                    spoiler={items[0].spoiler}
                />
                <div className="grid grid-cols-3 gap-[4px]">
                    {items.slice(1).map((item, i) => (
                        <PreviewMediaTile
                            key={`${item.media.url}-${i + 1}`}
                            mediaUrl={item.media.url}
                            description={item.description}
                            aspect="square"
                            spoiler={item.spoiler}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (count === 8) {
        return (
            <div
                className="rounded-[8px] overflow-hidden flex flex-col gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <div className="grid grid-cols-2 gap-[4px]">
                    <PreviewMediaTile
                        key={`${items[0].media.url}-0`}
                        mediaUrl={items[0].media.url}
                        description={items[0].description}
                        aspect="square"
                        spoiler={items[0].spoiler}
                    />
                    <PreviewMediaTile
                        key={`${items[1].media.url}-1`}
                        mediaUrl={items[1].media.url}
                        description={items[1].description}
                        aspect="square"
                        spoiler={items[1].spoiler}
                    />
                </div>
                <div className="grid grid-cols-3 gap-[4px]">
                    {items.slice(2).map((item, i) => (
                        <PreviewMediaTile
                            key={`${item.media.url}-${i + 2}`}
                            mediaUrl={item.media.url}
                            description={item.description}
                            aspect="square"
                            spoiler={item.spoiler}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (count === 9) {
        return (
            <div
                className="rounded-[8px] overflow-hidden grid grid-cols-3 gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                {items.map((item, i) => (
                    <PreviewMediaTile
                        key={`${item.media.url}-${i}`}
                        mediaUrl={item.media.url}
                        description={item.description}
                        aspect="square"
                        spoiler={item.spoiler}
                    />
                ))}
            </div>
        );
    }

    if (count === 10) {
        return (
            <div
                className="rounded-[8px] overflow-hidden flex flex-col gap-[4px]"
                style={{ maxWidth: container ? "100%" : "550px" }}
            >
                <PreviewMediaTile
                    key={`${items[0].media.url}-0`}
                    mediaUrl={items[0].media.url}
                    description={items[0].description}
                    aspect="video"
                    spoiler={items[0].spoiler}
                />
                <div className="grid grid-cols-3 gap-[4px]">
                    {items.slice(1).map((item, i) => (
                        <PreviewMediaTile
                            key={`${item.media.url}-${i + 1}`}
                            mediaUrl={item.media.url}
                            description={item.description}
                            aspect="square"
                            spoiler={item.spoiler}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // fallback: simple grid
    return (
        <div
            className="rounded-[8px] overflow-hidden grid grid-cols-3 gap-[4px]"
            style={{ maxWidth: container ? "100%" : "550px" }}
        >
            {items.map((item, i) => (
                <PreviewMediaTile
                    key={`${item.media.url}-${i}`}
                    mediaUrl={item.media.url}
                    description={item.description}
                    aspect="square"
                    spoiler={item.spoiler}
                />
            ))}
        </div>
    );
}
