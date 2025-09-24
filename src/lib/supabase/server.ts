import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

/**
 * Create a server-side Supabase client.
 *
 * @param useServiceRole - when true, use SUPABASE_SECRET_KEY (service role). Default false.
 */
export const createClient = async (useServiceRole = false) => {
    const cookieStore = await cookies();

    if (!supabaseUrl) {
        throw new Error("Missing SUPABASE_URL environment variable");
    }

    const key = useServiceRole ? supabaseSecretKey : supabasePublishableKey;

    if (!key) {
        throw new Error(
            useServiceRole
                ? "Missing SUPABASE_SECRET_KEY for service role usage"
                : "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
        );
    }

    // NOTE: service role key is powerful — never expose it to the browser.
    return createServerClient(supabaseUrl, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });
};
