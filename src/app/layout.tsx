import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "./providers/user-provider";

const body = Inter({
    variable: "--font-body",
    subsets: ["latin"],
});

const display = Inter_Tight({
    variable: "--font-display",
    subsets: ["latin"],
});

const discord = localFont({
    src: "../../public/ggsans.woff2",
    variable: "--font-preview",
});

export const metadata: Metadata = {
    title: "Message Kit",
    description: "The easiest way to personalize your Discord server.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${body.variable} ${display.variable} ${discord.variable} font-body antialiased`}
            >
                <UserProvider>{children}</UserProvider>
                <Toaster richColors position="bottom-right" />
            </body>
        </html>
    );
}
