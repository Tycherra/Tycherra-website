import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* PART 7.5 — AVIF first, then WebP. 82 is the quality the work
       plates are served at; Next 16 requires it to be declared. */
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82],
  },
};

export default nextConfig;
