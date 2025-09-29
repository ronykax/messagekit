"use client";

import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/user";

export default function Page() {
    const { user } = useUserStore();

    if (user) {
        window.location.href = "/select-guild";
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Button variant={"link"} className="text-white" asChild>
                <a href="/auth/login?redirect=/select-guild">
                    Login to use Message Kit
                    <ExternalLinkIcon />
                </a>
            </Button>
        </div>
    );
}
