import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Supabase auth error:", error);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        return NextResponse.redirect(`${origin}`);
    }

    console.error("No authorization code provided");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
