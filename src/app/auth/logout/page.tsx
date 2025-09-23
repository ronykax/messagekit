"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.signOut();
        window.location.href = "/";
    }, [supabase]);

    return (
        <div className="flex justify-center items-center h-screen text-sm text-muted-foreground">
            Logging you out...
        </div>
    );
}
