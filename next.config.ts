import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/proxy/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1"}/:path*`,
            },
        ];
    },
};

export default nextConfig;
