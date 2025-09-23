import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: {
        position: "top-right",
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;
