import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_TYPE, ogFonts } from "@/lib/og";

export const alt = "Contact us — Tycherra°";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        label="Contact us"
        lead="Tell us what you are building."
        clause="We reply within a working day."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
