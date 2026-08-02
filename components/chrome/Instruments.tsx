"use client";

import { useEffect, useRef } from "react";
import { ramp, rgb } from "@/lib/ramp";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    THE PERSISTENT INSTRUMENTS — PART 3.4.
    Spine with scroll marker · bearing dial with arc and percentage ·
    corner frame marks · film grain · the wash · the maze.

    All six read the smoothed Lenis position from lib/scroll, and all
    six write straight to the DOM. This is the panel that makes the
    page read as an instrument rather than a document, and it must not
    cost a single React render.

    The heat pair --hot / --hot2 is set on <html> from here, which is
    what makes every accent on the page — hover states, focus rings,
    indicators, gradient type — walk the ramp as the visitor descends.
    ═══════════════════════════════════════════════════════════════════ */

const ARC = 113.1; // 2πr for r = 18

type Props = {
  /** the route's heat station — PART 2.2 */
  from: number;
  to: number;
  /** how far --hot2 leads --hot along the ramp */
  lead?: number;
  /** deterministic per-route maze seed */
  seed: number;
};

export function Instruments({ from, to, lead = 0.22, seed }: Props) {
  const washRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const mazeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const cleanups: (() => void)[] = [];

    /* ═══ 23 · the maze ═══════════════════════════════════════════
       A line enters from an edge, works through the margins, leaves by
       another edge, re-enters elsewhere, and resolves into a circuit
       at the footer. Drawn by scroll.

       PART 8.4 — above 820px only.
       ═══════════════════════════════════════════════════════════ */
    let drawMaze: ((p: number) => void) | null = null;

    function buildMaze() {
      const svg = mazeRef.current;
      if (!svg || reduced || window.innerWidth <= 820) {
        drawMaze = null;
        if (svg) svg.innerHTML = "";
        return;
      }
      const W = window.innerWidth;
      const H = document.body.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("height", String(H));

      let s = seed;
      const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const M = Math.max(26, Math.min(W * 0.085, 120));
      const routes: { d: string; band: [number, number] }[] = [];
      const nodes: [number, number][] = [];

      /* four passes, each owning a scroll band, alternating sides */
      const bands: [number, number][] = [
        [0, 0.3],
        [0.24, 0.55],
        [0.48, 0.8],
        [0.72, 1],
      ];
      bands.forEach((b, i) => {
        const fromLeft = i % 2 === 0;
        let x = fromLeft ? 0 : W;
        let y = H * b[0] + H * 0.02;
        let d = `M${x} ${y}`;
        const inX = fromLeft ? M : W - M;
        d += `L${inX} ${y}`;
        x = inX;
        nodes.push([x, y]);
        const yEnd = H * b[1] - H * 0.02;
        const steps = 4 + Math.floor(rnd() * 3);
        for (let k = 0; k < steps; k++) {
          const ny = y + (yEnd - y) * ((k + 1) / steps);
          d += `L${x} ${ny}`;
          y = ny;
          if (k < steps - 1) {
            const j = (rnd() * 0.55 + 0.25) * M;
            const nx = fromLeft
              ? rnd() > 0.5
                ? M - j
                : M + j
              : rnd() > 0.5
                ? W - M + j
                : W - M - j;
            d += `L${nx} ${y}`;
            x = nx;
            nodes.push([x, y]);
          }
        }
        d += `L${fromLeft ? W : 0} ${y}`;
        routes.push({ d, band: b });
      });

      const marginNodeCount = nodes.length;

      /*  P2 — THE FOOTER CIRCUIT.

          The old resolution was three right-angle traces and five pads,
          and nobody noticed it. This is a real circuit: four parallel
          buses entering from both margins at staggered depths, each
          branching inward through its own right angle onto a shared
          spine, every branch carrying a junction pad, and one central
          terminal that completes last.

          The pads light from the outside inward, so the assembly reads
          as current arriving rather than as a drawing appearing. Every
          band is scrubbed by scroll, so the whole thing runs backwards
          when you scroll back up. */
      const fy = H - 210;
      const cx = W / 2;
      const bus = [0, 1, 2, 3].map((i) => ({
        y: fy + i * 26,
        /* how far in each bus travels before it turns down */
        x: Math.min(cx - 70, 150 + i * 92),
        /* outermost bus lands first, innermost last */
        band: [0.7 + i * 0.055, 0.82 + i * 0.055] as [number, number],
      }));

      const spineY = fy + 118;
      const termY = spineY + 42;

      for (const b of bus) {
        /* in from both margins, turn, and drop onto the spine */
        routes.push({
          d:
            `M0 ${b.y}L${b.x} ${b.y}L${b.x} ${spineY}` +
            `M${W} ${b.y}L${W - b.x} ${b.y}L${W - b.x} ${spineY}`,
          band: b.band,
        });
        nodes.push([b.x, b.y], [W - b.x, b.y]);
        nodes.push([b.x, spineY], [W - b.x, spineY]);
      }

      /* the shared spine, closing inward from both ends at once */
      const inner = bus[bus.length - 1].x;
      routes.push({
        d: `M${inner} ${spineY}L${cx} ${spineY}M${W - inner} ${spineY}L${cx} ${spineY}`,
        band: [0.9, 0.965],
      });

      /* the terminal — last to complete, and it holds a slow pulse */
      routes.push({
        d:
          `M${cx} ${spineY}L${cx} ${termY}` +
          `M${cx - 24} ${termY}L${cx + 24} ${termY}` +
          `M${cx - 24} ${termY}L${cx - 24} ${termY + 18}` +
          `M${cx + 24} ${termY}L${cx + 24} ${termY + 18}` +
          `M${cx - 24} ${termY + 18}L${cx + 24} ${termY + 18}`,
        band: [0.96, 1],
      });
      nodes.push([cx, spineY]);

      svg.innerHTML =
        routes
          .map(
            (r) =>
              `<path d="${r.d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`,
          )
          .join("") +
        nodes
          .map(
            ([x, y], i) =>
              `<circle cx="${x}" cy="${y}" r="${i === nodes.length - 1 ? 3.4 : 2.4}" data-y="${y}" data-order="${i}"${i === nodes.length - 1 ? ' class="term"' : ""}/>`,
          )
          .join("");

      const circuitNodeCount = nodes.length - marginNodeCount;
      const paths = Array.from(svg.querySelectorAll("path"));
      const dots = Array.from(svg.querySelectorAll("circle"));

      drawMaze = (p: number) => {
        paths.forEach((el, i) => {
          const b = routes[i].band;
          const k = (p - b[0]) / (b[1] - b[0]);
          el.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, k)));
        });
        const yNow = p * (H - window.innerHeight) + window.innerHeight * 0.9;
        /*  Margin nodes light as the scroll passes them. The circuit's
            own pads light in sequence from the outside inward across the
            last third, so the assembly reads as current arriving. */
        const seq = Math.max(0, (p - 0.68) / 0.32);
        dots.forEach((c) => {
          const order = Number(c.dataset.order);
          if (order < marginNodeCount) {
            c.style.opacity = Number(c.dataset.y) < yNow ? "0.9" : "0";
            return;
          }
          const k = (order - marginNodeCount) / Math.max(1, circuitNodeCount);
          c.style.opacity = seq > k ? "1" : "0";
        });
      };
    }

    /* ═══ the driver ══════════════════════════════════════════════ */
    const paint = ({ p }: { p: number }) => {
      /* PART 2.2 — the page walks its own band of the site-wide ramp */
      const s = from + p * (to - from);
      const c = ramp(s);
      const c2 = ramp(Math.min(1, s + lead));

      root.style.setProperty("--hot", rgb(c));
      root.style.setProperty("--hot2", rgb(c2));

      /* 20 — the spine marker */
      const m = markerRef.current;
      if (m) {
        m.style.top = `${p * 100}%`;
        m.style.background = rgb(c2);
        m.style.boxShadow = `0 0 16px 3px rgba(${c2[0]},${c2[1]},${c2[2]},.8)`;
      }

      /* 25 — the wash, at PART 2.3's reduced alpha */
      const wash = washRef.current;
      if (wash) {
        wash.style.background = `radial-gradient(ellipse 120% 80% at 50% ${18 + p * 64}%, rgba(${c2[0]},${c2[1]},${c2[2]},var(--wash-alpha)), transparent 72%)`;
      }

      /* 21 — the dial */
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(ARC * (1 - p));
      if (dialRef.current) dialRef.current.style.color = rgb(c2);
      if (pctRef.current)
        pctRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");

      if (drawMaze) drawMaze(p);
    };

    buildMaze();
    cleanups.push(onScroll(paint));

    let rz: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        buildMaze();
        paint({ p: Number(pctRef.current?.textContent ?? 0) / 100 });
      }, 280);
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    });

    /* the document keeps growing while reveals fire and images decode;
       the maze is laid out against its full height, so it has to be
       rebuilt once everything has landed */
    const settle = setTimeout(() => {
      buildMaze();
      paint({ p: Number(pctRef.current?.textContent ?? 0) / 100 });
    }, 1200);
    cleanups.push(() => clearTimeout(settle));

    return () => {
      for (const fn of cleanups) fn();
      root.style.removeProperty("--hot");
      root.style.removeProperty("--hot2");
    };
  }, [from, to, lead, seed]);

  return (
    <>
      {/* 25 */}
      <div className="wash" ref={washRef} aria-hidden="true" />
      {/* 23 */}
      <svg
        className="maze"
        ref={mazeRef}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      />
      {/* 24 */}
      <div className="grain" aria-hidden="true" />
      {/* 22 */}
      <div className="frm" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      {/* 20 */}
      <div className="spine" aria-hidden="true">
        <div className="spine__m" ref={markerRef} />
      </div>
      {/* 21 */}
      <div className="dial" ref={dialRef} aria-hidden="true">
        <svg viewBox="0 0 42 42" fill="none">
          <circle cx="21" cy="21" r="18" stroke="rgba(242,238,230,.13)" />
          <circle
            ref={arcRef}
            cx="21"
            cy="21"
            r="18"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeDasharray={ARC}
            strokeDashoffset={ARC}
            transform="rotate(-90 21 21)"
          />
        </svg>
        <span className="dial__n" ref={pctRef}>
          00
        </span>
      </div>
    </>
  );
}

