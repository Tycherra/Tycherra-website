import { ramp } from "./ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE BEARING FIELD — the live engine, ported from tycherra-v15.

    One canvas, running from the first frame. The loader is an overlay
    on this same animation, so the transition into the page is a
    dissolve rather than a cut.

    Nine behaviours:
      1  the point drifts on a compound Lissajous path when idle
      2  the cursor takes the point; it releases back to drift after 2.4s
      3  where the point lands, segments become nodes and wire together
      4  the headline occupies the field — segments bend around the type
      5  the breath: a wave of realignment travels outward every ~8s
      6  a per-segment shimmer, so the corners stay alive when nothing
         else is moving
      7  three depth layers parallax against the cursor
      8  click drops a mark; the field holds that heading until released
      9  on scroll, the field compresses into the point and hands it to
         the spine marker
    ═══════════════════════════════════════════════════════════════════ */

export type FieldApi = {
  /** loader progress, 0..1 — the field blooms as the scrim clears */
  warm(p: number): void;
  /** hand control back: free drift, and re-measure the type */
  release(): void;
  /** re-measure the type boxes (resize, fonts.ready) */
  measure(): void;
  /** 0..1 scroll handoff into the spine */
  setExit(v: number): void;
  destroy(): void;
};

export type FieldOptions = {
  canvas: HTMLCanvasElement;
  /** the element the field lives in; also the pointer/click surface */
  host: HTMLElement;
  /** selector for the type the field must bend around */
  typeSelector: string;
  /** live readouts */
  onReadout?: (bearing: string, nodes: string) => void;
  reduced: boolean;
  /*  PART 8.3 — /404 runs the same engine with nothing to converge on.
      Segments keep drifting on their own headings and never find the
      point, the nodes never form, and the bearing ring is not drawn.
      A field that cannot converge is the point of that page. */
  scatter?: boolean;
};

type Cell = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  a: number;
  z: number;
  sc: number;
  /** scatter only — the heading this segment drifts around */
  seed: number;
};

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

const TAU = Math.PI * 2;

export function createField(opts: FieldOptions): FieldApi {
  const { canvas, host, typeSelector, onReadout, reduced, scatter = false } = opts;
  const g = canvas.getContext("2d");
  if (!g) {
    return {
      warm() {},
      release() {},
      measure() {},
      setExit() {},
      destroy() {},
    };
  }

  let w = 0;
  let h = 0;
  let gap = 43;
  let cells: Cell[] = [];
  let boxes: Box[] = [];

  let t = 0;
  let fr = 0;
  let intro = 0;
  let align = 0;
  let exit = 0;

  /* 5 — the breath, on a cadence rather than a coin flip */
  let pulse = -1;
  let pulseAt: { x: number; y: number } | null = null;
  let nextPulse = 6.5 + Math.random() * 3;
  let sincePulse = 0;

  const A = { x: 0, y: 0, tx: 0, ty: 0, free: true, locked: false };
  const M = { x: 0, y: 0 };

  let raf = 0;
  let visible = true;
  let releaseTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  /* ── 4 · the type as an obstacle in the field ──────────────────── */
  function measure() {
    boxes = [];
    const hr = host.getBoundingClientRect();
    host.querySelectorAll<HTMLElement>(typeSelector).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      boxes.push({
        x: r.left - hr.left,
        y: r.top - hr.top,
        w: r.width,
        h: r.height,
        cx: r.left - hr.left + r.width / 2,
        cy: r.top - hr.top + r.height / 2,
      });
    });
  }

  /** distance to the nearest type block, and the direction it pushes */
  function typePush(x: number, y: number) {
    let best: Box | null = null;
    let bd = 1e9;
    for (const b of boxes) {
      const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
      const dy = Math.max(b.y - y, 0, y - (b.y + b.h));
      const d = Math.hypot(dx, dy);
      if (d < bd) {
        bd = d;
        best = b;
      }
    }
    if (!best) return null;
    const pad = gap * 2.2;
    if (bd > pad) return null;
    return { k: 1 - bd / pad, ang: Math.atan2(y - best.cy, x - best.cx) };
  }

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    /* PART 7.4 — guard offsetWidth === 0 on mount */
    if (!w || !h) return;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = w < 640 ? 31 : w < 1100 ? 37 : 43;

    cells = [];
    /* 7 — three depth layers */
    const layers = [
      { z: 0.34, step: gap * 1.55, sc: 0.62 },
      { z: 0.66, step: gap * 1.05, sc: 0.86 },
      { z: 1.0, step: gap, sc: 1.0 },
    ];
    for (const L of layers) {
      const cols = Math.ceil(w / L.step) + 2;
      const rows = Math.ceil(h / L.step) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          cells.push({
            ox: i * L.step + L.step * 0.5,
            oy: j * L.step + L.step * 0.5,
            x: 0,
            y: 0,
            a: Math.random() * TAU,
            z: L.z,
            sc: L.sc,
            seed: Math.random() * TAU,
          });
        }
      }
    }

    A.x = A.tx = w * 0.5;
    A.y = A.ty = h * 0.42;
    M.x = w * 0.5;
    M.y = h * 0.42;
    measure();
  }

  function draw() {
    if (!w || !h) return;
    const reach = Math.hypot(w, h) * 0.5;
    const near: { c: Cell; p: number }[] = [];
    g!.clearRect(0, 0, w, h);

    /* 7 — parallax offset from the cursor, per layer */
    const px = (M.x - w * 0.5) / w;
    const py = (M.y - h * 0.5) / h;

    for (const c of cells) {
      /* 7 — layer parallax, and 9 — compress toward the point on exit */
      const par = (1 - c.z) * 26;
      let cx = c.ox - px * par;
      let cy = c.oy - py * par;
      if (exit > 0) {
        cx += (A.x - cx) * exit * 0.55;
        cy += (A.y - cy) * exit * 0.55;
      }
      c.x = cx;
      c.y = cy;

      const dx = A.x - cx;
      const dy = A.y - cy;
      const d = Math.hypot(dx, dy);
      let want = scatter
        ? /* no bearing to take: each segment wanders around the heading
             it woke up with, and never arrives anywhere */
          c.seed + Math.sin(t * 0.55 + c.ox * 0.006) * 1.1
        : Math.atan2(dy, dx);

      /* 4 — bend around the type */
      const tp = typePush(cx, cy);
      if (tp) {
        let dd = tp.ang - want;
        while (dd > Math.PI) dd -= TAU;
        while (dd < -Math.PI) dd += TAU;
        want += dd * tp.k * 0.85;
      }

      /* 5 — a wave of scatter travelling outward, then re-finding */
      let turn = (0.01 + align * 0.092) * (0.4 + c.z * 0.6);
      if (pulse >= 0 && pulseAt) {
        const pd = Math.hypot(cx - pulseAt.x, cy - pulseAt.y);
        const front = pulse * Math.hypot(w, h) * 0.85;
        const bandW = gap * 4.2;
        const band = Math.abs(pd - front);
        if (band < bandW) {
          const k = 1 - band / bandW;
          want += Math.sin(pd * 0.05 + t * 4) * 1.5 * k;
          turn *= 1 - k * 0.75;
        }
      }

      /* 6 — a slow per-segment shimmer, so the field stays alive even
         when the point is far away and nothing else is moving */
      want += Math.sin(t * 1.15 + c.ox * 0.011 + c.oy * 0.009) * 0.085;

      let df = want - c.a;
      while (df > Math.PI) df -= TAU;
      while (df < -Math.PI) df += TAU;
      c.a += df * turn;

      const p = scatter
        ? 0.16 + Math.sin(c.seed * 3.1) * 0.06
        : Math.max(0, 1 - d / reach);
      const dim = tp ? 1 - tp.k * 0.55 : 1;
      const L = gap * (0.17 + p * 0.54) * c.sc * (0.45 + intro * 0.55) * (1 - exit * 0.35);
      const col = ramp(p);
      const al =
        (0.06 + p * 0.8) *
        (0.25 + intro * 0.75) *
        (0.35 + c.z * 0.65) *
        dim *
        (1 - exit * 0.5);

      g!.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`;
      g!.lineWidth = (0.5 + p * 1.6) * c.sc;
      g!.lineCap = "round";
      g!.beginPath();
      g!.moveTo(cx - Math.cos(c.a) * L * 0.5, cy - Math.sin(c.a) * L * 0.5);
      g!.lineTo(cx + Math.cos(c.a) * L * 0.5, cy + Math.sin(c.a) * L * 0.5);
      g!.stroke();

      if (!scatter && c.z === 1 && d < gap * 4.6 && intro > 0.5 && !tp)
        near.push({ c, p });
    }

    /* 3 — connections where attention lands */
    const lim = gap * 2.6;
    const na = Math.max(0, (intro - 0.5) * 2) * (1 - exit);
    for (let i = 0; i < near.length; i++) {
      for (let j = i + 1; j < near.length; j++) {
        const a = near[i].c;
        const b = near[j].c;
        const dd = Math.hypot(a.x - b.x, a.y - b.y);
        if (dd > lim) continue;
        const s = (1 - dd / lim) * Math.min(near[i].p, near[j].p);
        const col = ramp(0.72 + s * 0.28);
        g!.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${s * 0.42 * na})`;
        g!.lineWidth = 0.6;
        g!.beginPath();
        g!.moveTo(a.x, a.y);
        g!.lineTo(b.x, b.y);
        g!.stroke();
      }
      const nc = ramp(0.85);
      g!.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${near[i].p * 0.85 * na})`;
      g!.beginPath();
      g!.arc(near[i].c.x, near[i].c.y, 1.5, 0, TAU);
      g!.fill();
    }

    /* the ring — with a second, dashed ring when a mark is dropped */
    if (scatter) {
      if (++fr % 8 === 0 && onReadout) onReadout("---°", "NO FIX");
      return;
    }
    g!.save();
    g!.translate(A.x, A.y);
    g!.globalAlpha = intro * (1 - exit * 0.6);
    g!.strokeStyle = "rgba(255,122,26,.28)";
    g!.lineWidth = 1;
    g!.beginPath();
    g!.arc(0, 0, 42, 0, TAU);
    g!.stroke();
    g!.strokeStyle = "rgba(255,45,78,.12)";
    g!.beginPath();
    g!.arc(0, 0, 74, 0, TAU);
    g!.stroke();
    if (A.locked) {
      g!.strokeStyle = "rgba(255,182,39,.5)";
      g!.lineWidth = 1.1;
      g!.setLineDash([2, 5]);
      g!.beginPath();
      g!.arc(0, 0, 56, 0, TAU);
      g!.stroke();
      g!.setLineDash([]);
    }
    g!.rotate(t * 0.62);
    g!.strokeStyle = "rgba(255,182,39,.6)";
    g!.lineWidth = 1.3;
    for (let k = 0; k < 4; k++) {
      g!.beginPath();
      g!.moveTo(0, -42);
      g!.lineTo(0, -52);
      g!.stroke();
      g!.rotate(Math.PI / 2);
    }
    g!.restore();

    if (++fr % 8 === 0 && onReadout) {
      const bearing =
        String(
          Math.round((Math.atan2(A.y - h / 2, A.x - w / 2) * 57.2958 + 450) % 360),
        ).padStart(3, "0") + "°";
      onReadout(bearing, A.locked ? "HELD" : String(near.length));
    }
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible) return;

    t += 0.0052;

    /* 5 — breathe, roughly every eight seconds */
    sincePulse += 1 / 60;
    if (pulse < 0 && intro > 0.95 && sincePulse > nextPulse) {
      pulse = 0;
      pulseAt = { x: A.x, y: A.y };
      sincePulse = 0;
      nextPulse = 6.5 + Math.random() * 3;
    }
    if (pulse >= 0) {
      pulse += 0.011;
      if (pulse > 1.25) {
        pulse = -1;
        pulseAt = null;
      }
    }

    /* 1 — the compound Lissajous drift */
    if (A.free && !A.locked) {
      A.tx = w * 0.5 + Math.sin(t * 0.92) * w * 0.31 + Math.sin(t * 2.3) * w * 0.045;
      A.ty = h * 0.4 + Math.cos(t * 0.71) * h * 0.235 + Math.cos(t * 1.9) * h * 0.03;
    }
    A.x += (A.tx - A.x) * (A.locked ? 0.09 : 0.058);
    A.y += (A.ty - A.y) * (A.locked ? 0.09 : 0.058);

    draw();
  }

  /* ── 2 · the cursor takes the point ───────────────────────────── */
  const onPointerMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY > r.bottom) return;
    M.x = e.clientX - r.left;
    M.y = e.clientY - r.top;
    if (scatter || intro < 0.9 || A.locked) return;
    A.free = false;
    A.tx = M.x;
    A.ty = M.y;
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(() => {
      A.free = true;
    }, 2400);
  };

  /* ── 8 · click drops or lifts the mark ────────────────────────── */
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    if (scatter || intro < 0.9) return;
    const r = canvas.getBoundingClientRect();
    if (A.locked) {
      A.locked = false;
      A.free = true;
    } else {
      A.locked = true;
      A.tx = e.clientX - r.left;
      A.ty = e.clientY - r.top;
      pulse = 0;
      pulseAt = { x: A.tx, y: A.ty };
    }
  };

  /* PART 7.4 — debounce resize and rebuild geometry, never rescale.

     Driven by a ResizeObserver on the canvas rather than window.resize:
     the window event can arrive before layout has settled, and a build
     that reads a stale offsetWidth leaves the backing store at the old
     size with no second event coming to correct it. The observer only
     ever fires with a box that is already true. */
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (reduced) draw();
    }, 180);
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);

  /* PART 7.4 — pause off-screen */
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0 },
  );
  io.observe(host);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("click", onClick);
  window.addEventListener("resize", onResize);

  build();
  /* the canvas can mount at zero width inside a not-yet-laid-out flex
     parent; retry on the next frame rather than shipping an empty hero */
  if (!w || !h) requestAnimationFrame(build);

  if (reduced) {
    intro = 1;
    align = 1;
    A.free = true;
    requestAnimationFrame(() => {
      build();
      draw();
    });
  } else {
    raf = requestAnimationFrame(loop);
  }

  return {
    warm(p) {
      intro = p;
      align = Math.min(1, p * 1.25);
    },
    release() {
      A.free = true;
      measure();
    },
    measure,
    setExit(v) {
      exit = Math.max(0, Math.min(1, v));
    },
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(releaseTimer);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    },
  };
}
