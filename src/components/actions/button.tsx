import type { APIGuild } from "discord-api-types/v10";
import { PickaxeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import ActionsSheet from "./sheet";

export default function ActionsButton({
    messageId,
    guild,
}: {
    messageId: string;
    guild: APIGuild;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                disabled={messageId === "new"}
                onClick={() => setSheetOpen(true)}
            >
                <PickaxeIcon />
                Actions
            </Button>
            <ActionsSheet
                open={sheetOpen}
                setOpen={setSheetOpen}
                messageId={messageId}
                guild={guild}
            />
        </>
    );
}
