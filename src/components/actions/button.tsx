import { PickaxeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import ActionsSheet from "./sheet";

export default function ActionsButton({ templateId }: { templateId: string }) {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                disabled={templateId === "new"}
                onClick={() => setSheetOpen(true)}
            >
                <PickaxeIcon />
                Actions
            </Button>
            <ActionsSheet open={sheetOpen} setOpen={setSheetOpen} />
        </>
    );
}
