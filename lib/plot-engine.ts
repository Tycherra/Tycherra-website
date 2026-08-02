import { ramp } from "./ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE PLOTTER — a technical drawing that draws itself.

    The same head that plots the schematic on the home hero, factored
    out so /work's flow diagram uses it rather than a second copy. It
    plots stroke by stroke with a small amber head tracing the path,
    holds, wipes, and begins again.

    Plans are given in a normalised 0..1 box so a plan is independent
    of the canvas it lands on.
    ═══════════════════════════════════════════════════════════════════ */

export type Line = [number, number, number, number];

type Seg = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  at: number;
  frac: number;
};

export type PlotterOptions = {
  plan: () => Line[];
  reduced: boolean;
  /** ramp station the ink sits at, before the slow breathing offset */
  base?: number;
  /** frames the finished drawing is held before it wipes */
  hold?: number;
  speed?: number;
  lineWidth?: number;
};

const TAU = Math.PI * 2;

export function createPlotter(
  canvas: HTMLCanvasElement,
  opts: PlotterOptions,
): { destroy(): void } {
  const g = canvas.getContext("2d");
  if (!g) return { destroy() {} };

  const { plan, reduced, base = 0.8, hold = 300, speed = 0.0052 } = opts;

  let w = 0;
  let h = 0;
  let segs: Seg[] = [];
  let p = reduced ? 1 : 0;
  let phase: "plot" | "hold" | "wipe" = "plot";
  let held = 0;
  let t = 0;
  let raf = 0;
  let visible = true;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const raw = plan();
    segs = [];
    let total = 0;
    for (const [x1, y1, x2, y2] of raw) {
      const a = { x: x1 * w, y: y1 * h };
      const b = { x: x2 * w, y: y2 * h };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a, b, at: total, frac: len });
      total += len;
    }
    for (const s of segs) {
      s.at /= total;
      s.frac /= total;
    }
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || !w || !h) return;

    t += 0.01;
    g!.clearRect(0, 0, w, h);

    const small = w < 220;
    const c = ramp(base + Math.sin(t * 0.4) * 0.16);
    for (const s of segs) {
      const k = Math.max(0, Math.min(1, (p - s.at) / s.frac));
      if (k <= 0) continue;
      g!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.78)`;
      g!.lineWidth = opts.lineWidth ?? (small ? 0.95 : 1.2);
      g!.lineCap = "round";
      g!.beginPath();
      g!.moveTo(s.a.x, s.a.y);
      g!.lineTo(s.a.x + (s.b.x - s.a.x) * k, s.a.y + (s.b.y - s.a.y) * k);
      g!.stroke();
      /* the plotting head */
      if (k > 0 && k < 1) {
        g!.fillStyle = "rgba(255,182,39,.92)";
        g!.beginPath();
        g!.arc(
          s.a.x + (s.b.x - s.a.x) * k,
          s.a.y + (s.b.y - s.a.y) * k,
          small ? 1.4 : 1.9,
          0,
          TAU,
        );
        g!.fill();
      }
    }

    if (reduced) return;

    if (phase === "plot") {
      p += speed;
      if (p >= 1) {
        p = 1;
        phase = "hold";
        held = 0;
      }
    } else if (phase === "hold") {
      if (++held > hold) phase = "wipe";
    } else {
      p -= 0.017;
      if (p <= 0) {
        p = 0;
        phase = "plot";
      }
    }
  }

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(size, 200);
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);

  /* PART 7.4 — paused off-screen */
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  size();
  if (!w || !h) requestAnimationFrame(size);
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
    },
  };
}

/*  Test Ride has no public interface, so its plate states its flow
    instead: rider → OTP gate → handover → return → report. */
export function testRidePlan(): Line[] {
  const s: Line[] = [];
  const L = (a: number, b: number, c: number, d: number) => s.push([a, b, c, d]);

  const bx = [0.08, 0.3, 0.52, 0.74];
  const by = 0.36;
  const bw = 0.14;
  const bh = 0.16;

  bx.forEach((x, i) => {
    L(x, by, x + bw, by);
    L(x + bw, by, x + bw, by + bh);
    L(x + bw, by + bh, x, by + bh);
    L(x, by + bh, x, by);
    if (i < bx.length - 1) {
      const nx = bx[i + 1];
      L(x + bw, by + bh / 2, nx, by + bh / 2);
      L(nx - 0.017, by + bh / 2 - 0.017, nx, by + bh / 2);
      L(nx - 0.017, by + bh / 2 + 0.017, nx, by + bh / 2);
    }
  });

  /* the OTP gate, hung above the second station */
  L(0.37, 0.36, 0.37, 0.2);
  L(0.3, 0.2, 0.44, 0.2);
  L(0.3, 0.2, 0.3, 0.11);
  L(0.44, 0.2, 0.44, 0.11);
  L(0.3, 0.11, 0.44, 0.11);
  for (let i = 0; i < 4; i++) L(0.316 + i * 0.032, 0.145, 0.316 + i * 0.032, 0.166);

  /* the report, returned to the team */
  L(0.81, 0.52, 0.81, 0.64);
  L(0.66, 0.64, 0.96, 0.64);
  L(0.66, 0.64, 0.66, 0.88);
  L(0.96, 0.64, 0.96, 0.88);
  L(0.66, 0.88, 0.96, 0.88);
  for (let i = 0; i < 4; i++) L(0.7, 0.69 + i * 0.05, 0.92, 0.69 + i * 0.05);

  return s;
}
