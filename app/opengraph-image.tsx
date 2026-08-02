import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_TYPE, ogFonts } from "@/lib/og";

export const alt = "Studio — Tycherra°";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        label="Studio"
        lead="Most software is put together."
        clause="Ours is thought through."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
