import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_TYPE, ogFonts } from "@/lib/og";

export const alt = "About us — Tycherra°";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        label="About us"
        lead="Anyone can build what you asked for."
        clause="The harder thing is knowing what to ask."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
