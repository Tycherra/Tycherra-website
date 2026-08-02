/*  ═══════════════════════════════════════════════════════════════════
    THE HEAT RAMP — the single source of truth for colour.
    PART 2.1. No colour outside this ramp exists anywhere on the site.

    Isomorphic on purpose: the same five stops that the scroll driver
    interpolates at 60fps in stage 2 are the ones the server uses to
    stamp each route's entry station into the markup, so a page is
    already the right temperature before a single byte of JS arrives.
    ═══════════════════════════════════════════════════════════════════ */

export type RGB = readonly [number, number, number];

export const RAMP: readonly RGB[] = [
  [74, 10, 32], // --r0  oxblood   0.00
  [168, 16, 48], // --r1  deep      0.25
  [255, 45, 78], // --r2  crimson   0.50
  [255, 122, 26], // --r3  bearing   0.75
  [255, 182, 39], // --r4  amber     1.00
] as const;

/** Sample the ramp at 0..1. Linear between the five stops. */
export function ramp(p: number): RGB {
  const t = Math.max(0, Math.min(0.999, p)) * (RAMP.length - 1);
  const i = Math.floor(t);
  const k = t - i;
  const a = RAMP[i];
  const b = RAMP[i + 1] ?? a;
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

export const rgb = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

export const rgba = (c: RGB, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export const rampCss = (p: number) => rgb(ramp(p));

/** The --hot / --hot2 pair for a station. --hot2 leads by `lead`. */
export function heatPair(p: number, lead = 0.22) {
  return {
    "--hot": rampCss(p),
    "--hot2": rampCss(Math.min(1, p + lead)),
  } as React.CSSProperties;
}
