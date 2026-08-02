import { ramp } from "./ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE LOCK-IN — PART 4.4.

    On submit, a small field of scattered segments finds its bearing and
    holds. It is the same motion as the loader on the home hero, at a
    quarter the size: the site opens by finding a heading and closes by
    finding one, which is what makes the last screen feel like the end
    of something rather than a form receipt.

    Ported from tycherra-contact.html. Runs once, then stops — there is
    nothing to loop, and a finished confirmation should be still.
    ═══════════════════════════════════════════════════════════════════ */

const S = 72;
const GAP = 11;
const TAU = Math.PI * 2;

export function lockIn(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): () => void {
  const g = canvas.getContext("2d");
  if (!g) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = S * dpr;
  canvas.height = S * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pts: { x: number; y: number; a: number }[] = [];
  for (let i = 0; i < Math.ceil(S / GAP); i++) {
    for (let j = 0; j < Math.ceil(S / GAP); j++) {
      pts.push({
        x: i * GAP + GAP / 2,
        y: j * GAP + GAP / 2,
        a: Math.random() * TAU,
      });
    }
  }

  let k = reduced ? 1 : 0;
  let raf = 0;

  const draw = () => {
    g.clearRect(0, 0, S, S);
    const cx = S / 2;
    const cy = S / 2;

    for (const p of pts) {
      const want = Math.atan2(cy - p.y, cx - p.x);
      let d = want - p.a;
      while (d > Math.PI) d -= TAU;
      while (d < -Math.PI) d += TAU;
      p.a += d * (0.02 + k * 0.16);

      const dist = Math.hypot(cx - p.x, cy - p.y);
      const pr = Math.max(0, 1 - dist / (S * 0.62));
      const c = ramp(0.62 + pr * 0.38);
      const L = GAP * (0.3 + pr * 0.4) * (0.4 + k * 0.6);

      g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(0.15 + pr * 0.7) * k})`;
      g.lineWidth = 0.9;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(p.x - Math.cos(p.a) * L * 0.5, p.y - Math.sin(p.a) * L * 0.5);
      g.lineTo(p.x + Math.cos(p.a) * L * 0.5, p.y + Math.sin(p.a) * L * 0.5);
      g.stroke();
    }

    g.strokeStyle = `rgba(255,182,39,${0.5 * k})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(cx, cy, 15, 0, TAU);
    g.stroke();
  };

  if (reduced) {
    /* settle it in one pass rather than animating */
    for (let n = 0; n < 90; n++) {
      for (const p of pts) {
        const want = Math.atan2(S / 2 - p.y, S / 2 - p.x);
        let d = want - p.a;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        p.a += d * 0.18;
      }
    }
    draw();
    return () => {};
  }

  const step = () => {
    k = Math.min(1, k + 0.018);
    draw();
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);

  return () => cancelAnimationFrame(raf);
}
