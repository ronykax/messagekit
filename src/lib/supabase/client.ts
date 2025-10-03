import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/utils/db.types";

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!url || !key) {
        throw new Error("missing env variables in supabase/server.ts");
    }

    return createBrowserClient<Database>(url, key);
}
