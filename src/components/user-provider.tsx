"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/user";
import { createClient } from "@/lib/supabase/client";

export function UserProvider({ children }: { children: React.ReactNode }) {
    const setUser = useUserStore((s) => s.setUser);
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user ?? null);
        };

        init();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [setUser, supabase]);

    return <>{children}</>;
}
