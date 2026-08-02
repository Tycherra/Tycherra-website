import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* F7 — the floating dev badge sat bottom-left, where the WhatsApp
     control now lives, and appeared in every screenshot. */
  devIndicators: false,

  images: {
    /* PART 7.5 — AVIF first, then WebP. 82 is the quality the work
       plates are served at; Next 16 requires it to be declared. */
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82],
  },
};

export default nextConfig;
