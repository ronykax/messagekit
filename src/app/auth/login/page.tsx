"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginClient() {
    const supabase = createClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(searchParams.get("redirect") || "/")}`,
                scopes: "identify email guilds",
                queryParams: {
                    prompt: searchParams.get("prompt") || "consent",
                },
            },
        });
    }, [supabase, searchParams]);

    return (
        <div className="flex justify-center items-center h-screen text-sm text-muted-foreground">
            Logging you in...
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <LoginClient />
        </Suspense>
    );
}
