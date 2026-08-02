import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_TYPE, ogFonts } from "@/lib/og";

export const alt = "Work — Tycherra°";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        label="Work"
        lead="Selected work from the studio —"
        clause="built to be lived in."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
