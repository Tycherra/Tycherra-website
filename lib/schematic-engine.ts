import { letterPaths, type Line } from "./glyphs";
import { ramp } from "./ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE SCHEMATIC — a secondary instrument, top right.

    A technical drawing plots itself continuously, holds, wipes, and
    begins another. Peripheral by design: it never crosses the type and
    never interrupts, because at this size it reads as a readout rather
    than a picture.

    The caption is drawn, not written. It is lettered by the same
    plotting head, in the same pass, from the stroke alphabet in
    lib/glyphs.ts, and centred on the figure's true extent — so it can
    never sit wrong relative to the drawing. There is no HTML caption
    element anywhere near this canvas.

    Ported from tycherra-v15.
    ═══════════════════════════════════════════════════════════════════ */

type Seg = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  len: number;
  at: number;
  frac: number;
};

const TAU = Math.PI * 2;

const PLANS: Record<string, () => Line[]> = {
  WEBSITES: () => {
    const s: Line[] = [];
    const L = (a: number, b: number, c: number, d: number) => s.push([a, b, c, d]);
    L(0.08, 0.16, 0.92, 0.16);
    L(0.08, 0.16, 0.08, 0.84);
    L(0.92, 0.16, 0.92, 0.84);
    L(0.08, 0.84, 0.92, 0.84);
    L(0.08, 0.28, 0.92, 0.28);
    L(0.12, 0.22, 0.145, 0.22);
    L(0.165, 0.22, 0.19, 0.22);
    L(0.21, 0.22, 0.235, 0.22);
    L(0.13, 0.38, 0.52, 0.38);
    L(0.13, 0.45, 0.42, 0.45);
    L(0.13, 0.56, 0.34, 0.56);
    L(0.13, 0.56, 0.13, 0.74);
    L(0.34, 0.56, 0.34, 0.74);
    L(0.13, 0.74, 0.34, 0.74);
    L(0.4, 0.56, 0.61, 0.56);
    L(0.4, 0.56, 0.4, 0.74);
    L(0.61, 0.56, 0.61, 0.74);
    L(0.4, 0.74, 0.61, 0.74);
    L(0.67, 0.56, 0.88, 0.56);
    L(0.67, 0.56, 0.67, 0.74);
    L(0.88, 0.56, 0.88, 0.74);
    L(0.67, 0.74, 0.88, 0.74);
    return s;
  },
  SOFTWARE: () => {
    const s: Line[] = [];
    const L = (a: number, b: number, c: number, d: number) => s.push([a, b, c, d]);
    L(0.1, 0.2, 0.1, 0.8);
    L(0.1, 0.8, 0.92, 0.8);
    const p: [number, number][] = [
      [0.14, 0.7],
      [0.24, 0.56],
      [0.34, 0.62],
      [0.44, 0.42],
      [0.54, 0.5],
      [0.64, 0.34],
      [0.76, 0.4],
      [0.88, 0.26],
    ];
    for (let i = 1; i < p.length; i++) L(p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]);
    for (let i = 0; i < 8; i++) {
      const x = 0.14 + i * 0.105;
      L(x, 0.8, x, 0.775);
    }
    for (let i = 0; i < 4; i++) {
      const y = 0.26 + i * 0.14;
      L(0.1, y, 0.125, y);
    }
    p.forEach(([x, y]) => {
      L(x - 0.012, y, x + 0.012, y);
      L(x, y - 0.018, x, y + 0.018);
    });
    return s;
  },
  "AI SOLUTIONS": () => {
    const s: Line[] = [];
    const L = (a: number, b: number, c: number, d: number) => s.push([a, b, c, d]);
    /* a small layered network: inputs → hidden → output */
    const col: [number, number[]][] = [
      [0.16, [0.24, 0.4, 0.56, 0.72]],
      [0.42, [0.22, 0.38, 0.54, 0.7]],
      [0.68, [0.32, 0.5, 0.68]],
      [0.9, [0.5]],
    ];
    col.forEach(([x, ys], ci) => {
      ys.forEach((y) => {
        const r = 0.026;
        L(x - r, y - r * 1.35, x + r, y - r * 1.35);
        L(x + r, y - r * 1.35, x + r, y + r * 1.35);
        L(x + r, y + r * 1.35, x - r, y + r * 1.35);
        L(x - r, y + r * 1.35, x - r, y - r * 1.35);
      });
      if (ci < col.length - 1) {
        const [nx, nys] = col[ci + 1];
        ys.forEach((y) => nys.forEach((ny) => L(x + 0.026, y, nx - 0.026, ny)));
      }
    });
    return s;
  },
};

const KEYS = Object.keys(PLANS);

export function createSchematic(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): { destroy(): void } {
  const g = canvas.getContext("2d");
  if (!g) return { destroy() {} };

  let w = 0;
  let h = 0;
  let segs: Seg[] = [];
  let drawn = 0;
  let phase: "plot" | "hold" | "wipe" = "plot";
  let hold = 0;
  let idx = 0;
  let t = 0;
  let raf = 0;
  let visible = true;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  function plot(name: string) {
    const raw = PLANS[name]();
    /* the figure occupies the upper region; lettering sits beneath it */
    const figH = h * 0.845;
    const lines: Line[] = raw.map(([x1, y1, x2, y2]) => [
      x1 * w,
      y1 * figH,
      x2 * w,
      y2 * figH,
    ]);

    /* find the figure's true extent so the caption centres on the
       drawing rather than on the canvas */
    let minX = 1e9;
    let maxX = -1e9;
    for (const [a, , c] of lines) {
      minX = Math.min(minX, a, c);
      maxX = Math.max(maxX, a, c);
    }

    /* 19 — lettering scales with the canvas, as does everything else */
    const size = Math.max(5.5, Math.min(9, h * 0.055));
    const baseY = figH + h * 0.022;
    lines.push(...letterPaths(name, (minX + maxX) / 2, baseY, size));

    segs = [];
    let total = 0;
    for (const [x1, y1, x2, y2] of lines) {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a, b, len, at: total, frac: 0 });
      total += len;
    }
    for (const s of segs) {
      s.at /= total;
      s.frac = s.len / total;
    }
  }

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);
    plot(KEYS[idx % KEYS.length]);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || !w || !h) return;

    t += 0.01;
    g!.clearRect(0, 0, w, h);

    /* 19 — graticule density and line weight scale with canvas size */
    const small = w < 190;
    g!.strokeStyle = `rgba(242,238,230,${small ? 0.03 : 0.042})`;
    g!.lineWidth = 1;
    const gx = small ? 4 : 8;
    const gy = small ? 3 : 6;
    for (let i = 1; i < gx; i++) {
      const x = (w * i) / gx;
      g!.beginPath();
      g!.moveTo(x, 0);
      g!.lineTo(x, h * 0.845);
      g!.stroke();
    }
    for (let i = 1; i < gy; i++) {
      const y = (h * 0.845 * i) / gy;
      g!.beginPath();
      g!.moveTo(0, y);
      g!.lineTo(w, y);
      g!.stroke();
    }

    const c = ramp(0.62 + Math.sin(t * 0.4) * 0.2);
    for (const s of segs) {
      const k = Math.max(0, Math.min(1, (drawn - s.at) / s.frac));
      if (k <= 0) continue;
      g!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
      g!.lineWidth = small ? 0.85 : 1;
      g!.lineCap = "round";
      g!.beginPath();
      g!.moveTo(s.a.x, s.a.y);
      g!.lineTo(s.a.x + (s.b.x - s.a.x) * k, s.a.y + (s.b.y - s.a.y) * k);
      g!.stroke();
      /* the plotting head */
      if (k > 0 && k < 1) {
        g!.fillStyle = "rgba(255,182,39,.9)";
        g!.beginPath();
        g!.arc(
          s.a.x + (s.b.x - s.a.x) * k,
          s.a.y + (s.b.y - s.a.y) * k,
          small ? 1.2 : 1.7,
          0,
          TAU,
        );
        g!.fill();
      }
    }

    if (phase === "plot") {
      drawn += small ? 0.0072 : 0.0055;
      if (drawn >= 1) {
        phase = "hold";
        hold = 0;
      }
    } else if (phase === "hold") {
      hold++;
      if (hold > 220) phase = "wipe";
    } else {
      drawn -= 0.018;
      if (drawn <= 0) {
        drawn = 0;
        idx++;
        plot(KEYS[idx % KEYS.length]);
        phase = "plot";
      }
    }
  }

  /* observed on the canvas, not the window — see the note in
     lib/field-engine.ts on why the window event is not enough */
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(size, 200);
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  window.addEventListener("resize", onResize);
  size();
  if (!w || !h) requestAnimationFrame(size);

  if (reduced) drawn = 1;
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    },
  };
}
