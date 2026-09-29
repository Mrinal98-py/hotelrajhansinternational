import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/offers",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
