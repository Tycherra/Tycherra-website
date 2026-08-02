import type { CSSProperties } from "react";
import { rampCss } from "@/lib/ramp";

/** Inline styles that also carry custom properties. */
type CSSVars = CSSProperties & Record<`--${string}`, string>;

/*  ═══════════════════════════════════════════════════════════════════
    BLOOM — ambient light, never a filled rectangle. PART 0.2 / 2.3.
    A soft radial at a station on the ramp, at .32 alpha and 96px blur:
    a dark room with warm light in it, not a warm room.
    ═══════════════════════════════════════════════════════════════════ */

export function Bloom({
  p,
  x,
  y,
  w,
  max,
  ratio = 1,
}: {
  /** station on the ramp, 0..1 */
  p: number;
  /** left / right offset, e.g. "-15vw" or { right: "-19vw" } */
  x: { left: string } | { right: string };
  y: string;
  w: string;
  max: string;
  ratio?: number;
}) {
  return (
    <div
      className="bloom"
      aria-hidden="true"
      style={
        {
          ...x,
          top: y,
          width: w,
          maxWidth: max,
          aspectRatio: `${ratio}`,
          "--bloom-tint": rampCss(p),
        } as CSSVars
      }
    />
  );
}
