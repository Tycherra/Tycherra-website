import { ramp } from "./ramp";

/*  ═══════════════════════════════════════════════════════════════════
    THE METHOD — /about's signature, ported live from tycherra-about.

    One set of a hundred and fifty points, four arrangements. Scroll
    drives them from a scatter, into clusters, onto a lattice, and
    finally into a built system with connections. It is the argument
    the page is making, performed: the same material, given structure
    a stage at a time.

    It must START at SCATTER and only resolve as the visitor descends,
    and it must reverse on the way back up. The progress is read from
    the section's own travel through the viewport, not from a one-shot
    observer — a one-shot cannot reverse, and seeding from the final
    state is what made the first build arrive already solved.
    ═══════════════════════════════════════════════════════════════════ */

const N = 150;
const NAMES = ["SCATTER", "CLUSTER", "LATTICE", "SYSTEM"] as const;
const TAU = Math.PI * 2;

type Pt = { s: [number, number][]; x: number; y: number };

export type MethodApi = {
  /** 0..1 through the section — the driver calls this on every scroll */
  setProgress(p: number): void;
  destroy(): void;
};

export function createMethod(
  canvas: HTMLCanvasElement,
  onReadout: (name: string, pct: string) => void,
  reduced: boolean,
): MethodApi {
  const g = canvas.getContext("2d");
  if (!g) return { setProgress() {}, destroy() {} };

  let w = 0;
  let h = 0;
  let pts: Pt[] = [];
  let nodes: [number, number][] = [];
  let tiers: number[] = [];
  let target = 0;
  /* the drawn value trails the target, so a flick of the wheel eases
     rather than snapping between states */
  let shown = 0;
  let t = 0;
  let raf = 0;
  let visible = true;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  function states() {
    /* a stable pseudo-random, so the scatter is the same every load */
    let seed = 20260801;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const S: [number, number][][] = [[], [], [], []];
    const pad = Math.min(w, h) * 0.1;
    const iw = w - pad * 2;
    const ih = h - pad * 2;

    /* 0 — scatter: the problem as it arrives */
    for (let i = 0; i < N; i++) S[0].push([pad + rnd() * iw, pad + rnd() * ih]);

    /* 1 — cluster: themes emerge */
    const cs: [number, number][] = [
      [0.22, 0.3],
      [0.7, 0.24],
      [0.34, 0.74],
      [0.78, 0.7],
    ];
    for (let i = 0; i < N; i++) {
      const c = cs[i % 4];
      const a = rnd() * TAU;
      const r = Math.pow(rnd(), 0.6) * Math.min(iw, ih) * 0.15;
      S[1].push([pad + c[0] * iw + Math.cos(a) * r, pad + c[1] * ih + Math.sin(a) * r]);
    }

    /* 2 — lattice: everything given a place */
    const cols = Math.ceil(Math.sqrt(N * (iw / ih)));
    const rows = Math.ceil(N / cols);
    for (let i = 0; i < N; i++) {
      S[2].push([
        pad + ((i % cols) + 0.5) / cols * iw,
        pad + (Math.floor(i / cols) + 0.5) / rows * ih,
      ]);
    }

    /* 3 — system: four tiers, wired */
    const T = [4, 6, 5, 3];
    const gapY = ih / (T.length + 1);
    const nd: [number, number][] = [];
    T.forEach((n, ti) => {
      for (let k = 0; k < n; k++) nd.push([pad + ((k + 0.5) / n) * iw, pad + gapY * (ti + 1)]);
    });
    for (let i = 0; i < N; i++) {
      const p = nd[i % nd.length];
      const a = rnd() * TAU;
      const r = Math.pow(rnd(), 0.5) * Math.min(iw, ih) * 0.026;
      S[3].push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]);
    }

    nodes = nd;
    tiers = T;
    return S;
  }

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const S = states();
    pts = [];
    for (let i = 0; i < N; i++) {
      /* seeded AT THE SCATTER, never at the resolved state */
      pts.push({ s: [S[0][i], S[1][i], S[2][i], S[3][i]], x: S[0][i][0], y: S[0][i][1] });
    }
  }

  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  function draw() {
    if (!w || !h || !pts.length) return;
    g!.clearRect(0, 0, w, h);

    const P = Math.max(0, Math.min(0.9999, shown)) * 3;
    const i0 = Math.floor(P);
    const i1 = Math.min(3, i0 + 1);
    const k = ease(P - i0);

    /* the lattice and system stages carry connections */
    const wire = Math.max(0, (shown - 0.55) / 0.45);
    if (wire > 0 && nodes.length) {
      const c = ramp(0.7);
      g!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${wire * 0.3})`;
      g!.lineWidth = 0.9;
      let off = 0;
      for (let ti = 0; ti < tiers.length - 1; ti++) {
        const aEnd = off + tiers[ti];
        const bEnd = aEnd + tiers[ti + 1];
        for (let a = off; a < aEnd; a++) {
          for (let b = aEnd; b < bEnd; b++) {
            if ((a + b) % 2) continue;
            g!.beginPath();
            g!.moveTo(nodes[a][0], nodes[a][1]);
            g!.lineTo(nodes[b][0], nodes[b][1]);
            g!.stroke();
          }
        }
        off = aEnd;
      }
    }

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const a = p.s[i0];
      const b = p.s[i1];
      const tx = a[0] + (b[0] - a[0]) * k;
      const ty = a[1] + (b[1] - a[1]) * k;
      /* a little drift so it never looks frozen, damped as it resolves */
      const dx = Math.sin(t * 0.9 + i * 0.7) * 1.5 * (1 - shown * 0.6);
      const dy = Math.cos(t * 0.8 + i * 0.5) * 1.5 * (1 - shown * 0.6);
      p.x += (tx + dx - p.x) * 0.14;
      p.y += (ty + dy - p.y) * 0.14;
      const col = ramp(0.3 + shown * 0.62 + (i % 7) / 60);
      g!.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.32 + shown * 0.5})`;
      g!.beginPath();
      g!.arc(p.x, p.y, 1.1 + shown * 1.15, 0, TAU);
      g!.fill();
    }

    /* a frame that tightens as the system resolves */
    const inset = 10 + (1 - shown) * 14;
    const fc = ramp(0.42 + shown * 0.5);
    g!.strokeStyle = `rgba(${fc[0]},${fc[1]},${fc[2]},${0.1 + shown * 0.3})`;
    g!.lineWidth = 1;
    const B = Math.min(w, h) * 0.12;
    (
      [
        [inset, inset + B, inset, inset, inset + B, inset],
        [w - inset - B, inset, w - inset, inset, w - inset, inset + B],
        [w - inset, h - inset - B, w - inset, h - inset, w - inset - B, h - inset],
        [inset + B, h - inset, inset, h - inset, inset, h - inset - B],
      ] as const
    ).forEach(([x1, y1, x2, y2, x3, y3]) => {
      g!.beginPath();
      g!.moveTo(x1, y1);
      g!.lineTo(x2, y2);
      g!.lineTo(x3, y3);
      g!.stroke();
    });
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    t += 0.012;
    shown += (target - shown) * 0.09;
    draw();
    const idx = Math.min(3, Math.round(shown * 3));
    onReadout(NAMES[idx], `${String(Math.round(shown * 100)).padStart(2, "0")}%`);
  }

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw();
    }, 200);
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

  build();
  if (!w || !h) requestAnimationFrame(build);

  if (reduced) {
    /* still, and resolved — the argument survives without the motion */
    target = 1;
    shown = 1;
    requestAnimationFrame(() => {
      build();
      draw();
      onReadout(NAMES[3], "100%");
    });
  } else {
    draw();
    raf = requestAnimationFrame(loop);
  }

  return {
    setProgress(p) {
      if (reduced) return;
      target = Math.max(0, Math.min(1, p));
    },
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
    },
  };
}
