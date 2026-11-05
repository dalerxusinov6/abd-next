import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // project forms can carry a cover + several gallery images
    serverActions: { bodySizeLimit: "40mb" },
  },
};

export default nextConfig;
