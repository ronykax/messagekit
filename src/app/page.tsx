import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Button variant={"link"} className="text-white" asChild>
                <a href="/auth/login">
                    Login to use Message Kit
                    <ExternalLinkIcon />
                </a>
            </Button>
        </div>
    );
}
