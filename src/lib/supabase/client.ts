import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/utils/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables");
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};
