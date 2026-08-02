import { ramp } from "@/lib/ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE METHOD — STATIC PLATE
    One hundred and fifty points, resolved into the fourth state:
    four tiers, wired. It is the argument the page is making, held
    still — the same material, given structure.

    Stage 3 drives the same point set backwards through SYSTEM →
    LATTICE → CLUSTER → SCATTER on scroll position within the sticky
    container, with the live state readout beneath. The geometry here
    is the terminal frame of that sequence, generated from the same
    seed, so nothing jumps when the driver takes over.
    ═══════════════════════════════════════════════════════════════════ */

const W = 600;
const H = 420;
const N = 150;
const TIERS = [4, 6, 5, 3] as const;

export function MethodPlate() {
  let seed = 20260801;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const pad = Math.min(W, H) * 0.1;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const gapY = ih / (TIERS.length + 1);

  const nodes: [number, number][] = [];
  TIERS.forEach((n, ti) => {
    for (let k = 0; k < n; k++) {
      nodes.push([pad + ((k + 0.5) / n) * iw, pad + gapY * (ti + 1)]);
    }
  });

  /* The scatter is consumed first so the resolved positions land on
     the same pseudo-random stream the live engine walks. */
  for (let i = 0; i < N * 3; i++) rnd();

  /* One hundred and fifty circle elements is a hundred and fifty DOM
     nodes serialised twice into the page. A zero-length line segment
     with a round cap paints the same dot in ten characters, so the
     points collapse into seven paths — one per tint. */
  const dots: string[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < N; i++) {
    const nd = nodes[i % nodes.length];
    const a = rnd() * Math.PI * 2;
    const r = Math.pow(rnd(), 0.5) * Math.min(iw, ih) * 0.026;
    dots[i % 7].push(
      `M${(nd[0] + Math.cos(a) * r).toFixed(1)} ${(nd[1] + Math.sin(a) * r).toFixed(1)}h0`,
    );
  }

  const wires: string[] = [];
  let off = 0;
  for (let ti = 0; ti < TIERS.length - 1; ti++) {
    const aStart = off;
    const aEnd = off + TIERS[ti];
    const bEnd = aEnd + TIERS[ti + 1];
    for (let a = aStart; a < aEnd; a++) {
      for (let b = aEnd; b < bEnd; b++) {
        if ((a + b) % 2) continue;
        wires.push(
          `M${nodes[a][0].toFixed(1)} ${nodes[a][1].toFixed(1)}L${nodes[b][0].toFixed(1)} ${nodes[b][1].toFixed(1)}`,
        );
      }
    }
    off = aEnd;
  }

  const wireC = ramp(0.7);
  const frameC = ramp(0.92);
  const inset = 10;
  const B = Math.min(W, H) * 0.12;

  const corners = [
    `M${inset} ${inset + B}L${inset} ${inset}L${inset + B} ${inset}`,
    `M${W - inset - B} ${inset}L${W - inset} ${inset}L${W - inset} ${inset + B}`,
    `M${W - inset} ${H - inset - B}L${W - inset} ${H - inset}L${W - inset - B} ${H - inset}`,
    `M${inset + B} ${H - inset}L${inset} ${H - inset}L${inset} ${H - inset - B}`,
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={wires.join("")}
        fill="none"
        stroke={`rgba(${wireC[0]},${wireC[1]},${wireC[2]},0.3)`}
        strokeWidth={0.9}
      />
      {dots.map((d, i) => {
        const col = ramp(0.92 + i / 60);
        return (
          <path
            key={i}
            d={d.join("")}
            stroke={`rgba(${col[0]},${col[1]},${col[2]},0.82)`}
            strokeWidth={4.5}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <path
        d={corners.join("")}
        fill="none"
        stroke={`rgba(${frameC[0]},${frameC[1]},${frameC[2]},0.4)`}
        strokeWidth={1}
      />
    </svg>
  );
}
