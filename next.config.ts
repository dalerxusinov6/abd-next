import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // uploaded covers are often 1–2 MB PNGs: serve them resized as AVIF/WebP
    localPatterns: [{ pathname: "/uploads/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // upload names are never reused
  },
  experimental: {
    // project forms can carry a cover + several gallery images
    serverActions: { bodySizeLimit: "40mb" },
  },
};

export default nextConfig;
