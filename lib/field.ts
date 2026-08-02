import { ramp } from "./ramp.ts";

/*  ═══════════════════════════════════════════════════════════════════
    THE BEARING FIELD — STATIC PLATE
    Stage 1 ships no canvas and no motion, so the field is stated
    rather than run: the same geometry the live engine produces,
    resolved once and written out as SVG.

    It is the real thing at rest. Segments take their heading from the
    convergence point, shorten and cool with distance from it, bend out
    of the headline's band, and carry the same slow per-segment shimmer
    offset — frozen at t = 0. Stage 3 puts the live canvas on top of
    this element and stage 6 leaves the plate underneath as the
    reduced-motion and no-JavaScript answer, so none of it is throwaway.

    ── why it is drawn at fixed pixel size ──────────────────────────
    The live engine rebuilds its grid from the element's real pixel
    box, so a segment is the same length on a phone and on a 4K panel.
    A scaled SVG cannot do that: slicing a 1440×900 viewBox into a
    390×812 hero magnifies every segment by 1.8 and the field reads as
    fallen matchsticks. So the plate is emitted at 1:1 and anchored to
    the top right of its container, which crops it the way the live
    canvas would size itself, and CSS steps the whole drawing down at
    the two mobile breakpoints. PART 0.3 — every effect needs a mobile
    answer.

    ── why it is a file and not JSX ─────────────────────────────────
    Inlined, seventeen hundred segments are serialised twice into every
    static page: once as markup and once again into the RSC payload.
    That put 86KB of geometry into the home document. As a generated
    asset it is fetched once, cached, and never parsed by React.
    Written by scripts/generate-field.mts.
    ═══════════════════════════════════════════════════════════════════ */

export const FIELD_W = 2600;
export const FIELD_H = 1500;
const BUCKETS = 8;

export type FieldTuning = {
  /* where the ramp starts, and how much of it the field spans */
  base: number;
  span: number;
  /* the convergence point, normalised to the plate */
  ax: number;
  ay: number;
  /* the band the headline occupies — segments bend out of it */
  type?: { y: number; h: number };
  /* ceiling on segment alpha, so a header sits quieter than a hero */
  gain: number;
  /* PART 8.3 — /404 holds a field that cannot find its bearing:
     every segment keeps the heading it woke up with. */
  scatter?: boolean;
};

/* Two depth layers. The gaps are deliberately not in a whole ratio —
   at 1.5× they interleave into a moiré and the still frame reads as a
   printed sunburst rather than a field. */
const LAYERS = [
  { z: 0.5, gap: 88, sc: 0.68, ox: 0.31, oy: 0.62 },
  { z: 1, gap: 60, sc: 1, ox: 0.74, oy: 0.19 },
] as const;

function build(t: FieldTuning) {
  let seed = 20260801;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const ax = t.ax * FIELD_W;
  const ay = t.ay * FIELD_H;
  const reach = Math.hypot(FIELD_W, FIELD_H) * 0.42;

  const band = t.type
    ? { top: t.type.y * FIELD_H, bottom: (t.type.y + t.type.h) * FIELD_H }
    : null;

  const buckets: string[][] = Array.from({ length: BUCKETS }, () => []);

  for (const L of LAYERS) {
    const cols = Math.ceil(FIELD_W / L.gap) + 1;
    const rows = Math.ceil(FIELD_H / L.gap) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i + L.ox) * L.gap;
        const y = (j + L.oy) * L.gap;

        const d = Math.hypot(ax - x, ay - y);
        let angle = Math.atan2(ay - y, ax - x);

        /* the headline occupies the field — segments bend out of its
           band and dim, so the type always sits in cleared air */
        let dim = 1;
        if (band) {
          const dy = Math.max(band.top - y, 0, y - band.bottom);
          const pad = L.gap * 2.2;
          if (dy < pad) {
            const k = 1 - dy / pad;
            const mid = (band.top + band.bottom) / 2;
            let dd = Math.atan2(y - mid, 0.001) - angle;
            while (dd > Math.PI) dd -= Math.PI * 2;
            while (dd < -Math.PI) dd += Math.PI * 2;
            angle += dd * k * 0.7;
            dim = 1 - k * 0.62;
          }
        }

        let p = Math.max(0, 1 - d / reach);

        /* the shimmer that keeps the field alive, frozen at t = 0 */
        angle += Math.sin(x * 0.011 + y * 0.009) * 0.085;

        /* Segments turn toward the heading at roughly a tenth a frame,
           so the further one sits from the point the further behind it
           lags. Without this the still frame collapses into a starburst
           the live field never actually shows. */
        angle += (rnd() - 0.5) * (0.62 + Math.pow(1 - p, 1.3) * 2.4);

        if (t.scatter) {
          /* nothing to converge on, and no light gained by trying */
          angle = rnd() * Math.PI * 2;
          p = 0.2 + rnd() * 0.22;
        }

        const alpha = (0.06 + p * 0.78) * (0.35 + L.z * 0.65) * dim * t.gain;
        if (alpha < 0.03) continue;

        const len = L.gap * (0.17 + p * 0.52) * L.sc;
        const hx = (Math.cos(angle) * len) / 2;
        const hy = (Math.sin(angle) * len) / 2;

        const x1 = Math.round(x - hx);
        const y1 = Math.round(y - hy);

        /* relative close, so the delta is two digits rather than four */
        const b = Math.min(BUCKETS - 1, Math.round(p * (BUCKETS - 1)));
        buckets[b].push(
          `M${x1} ${y1}l${Math.round(hx * 2)} ${Math.round(hy * 2)}`,
        );
      }
    }
  }

  return { buckets, ax, ay };
}

export function fieldSvg(t: FieldTuning): string {
  const { buckets, ax, ay } = build(t);

  const paths = buckets
    .map((seg, b) => {
      if (!seg.length) return "";
      const p = b / (BUCKETS - 1);
      const c = ramp(t.base + p * t.span);
      const alpha = ((0.05 + p * 0.62) * t.gain).toFixed(3);
      const width = (0.6 + p * 1.4).toFixed(2);
      return `<path d="${seg.join("")}" stroke="rgba(${c[0]},${c[1]},${c[2]},${alpha})" stroke-width="${width}"/>`;
    })
    .join("");

  const ring = ramp(Math.min(1, t.base + t.span * 0.85));
  const cx = t.ax * FIELD_W;
  const cy = t.ay * FIELD_H;
  const inFrame =
    ax > -80 && ax < FIELD_W + 80 && ay > -80 && ay < FIELD_H + 80;

  /* the bearing ring, held at the convergence point */
  const rings = inFrame
    ? `<g fill="none">` +
      `<circle cx="${cx}" cy="${cy}" r="42" stroke="rgba(${ring[0]},${ring[1]},${ring[2]},0.26)" stroke-width="1"/>` +
      `<circle cx="${cx}" cy="${cy}" r="74" stroke="rgba(${ring[0]},${ring[1]},${ring[2]},0.11)" stroke-width="1"/>` +
      [0, 90, 180, 270]
        .map(
          (deg) =>
            `<line x1="${cx}" y1="${cy - 42}" x2="${cx}" y2="${cy - 52}" stroke="rgba(255,182,39,0.5)" stroke-width="1.3" transform="rotate(${deg} ${cx} ${cy})"/>`,
        )
        .join("") +
      `</g>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FIELD_W}" height="${FIELD_H}" ` +
    `viewBox="0 0 ${FIELD_W} ${FIELD_H}" fill="none" stroke-linecap="round">` +
    paths +
    rings +
    `</svg>`
  );
}

/*  The plates the site ships. Keyed by the file they are written to. */
export const FIELDS: Record<string, FieldTuning> = {
  /* The home plate is gone: the hero runs the live canvas engine in
     lib/field-engine.ts. Only /404 still states its field, because a
     field that cannot converge has nothing to animate. */
  "not-found": {
    base: 0,
    span: 0.55,
    ax: 1.75,
    ay: -0.85,
    gain: 1.05,
    scatter: true,
  },
};
