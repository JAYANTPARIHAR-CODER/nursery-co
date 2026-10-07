import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalog photography is centralised in src/lib/data/media.ts.
    // Swap this host for your own CDN when real nursery photos land.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
