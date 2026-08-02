"use client";

import { useEffect, useRef } from "react";
import { createPlotter, testRidePlan } from "@/lib/plot-engine";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    /work — the live layer.

    Three things the prototype does that markup alone cannot:

      · every project's frame is DRAWN, not styled. Corner brackets and
        dimension leads are measured against the plate's real pixel box
        and plot in as the project arrives; only then is the screenshot
        wiped in inside them.
      · the entry with no public interface plots its flow instead, on
        the same head as the home schematic (lib/plot-engine).
      · the left index tracks which project you are in.

    Reuses the scroll store rather than adding observers of its own, so
    the rail, the heat, the spine and the dial cannot drift apart.
    ═══════════════════════════════════════════════════════════════════ */

/*  Geometry lifted from tycherra-work.html: four corner brackets and
    six dimension leads, sized against the plate. */
function frameFor(svg: SVGSVGElement) {
  const st = svg.closest<HTMLElement>(".pl__st");
  if (!st) return;
  const w = st.offsetWidth;
  const h = st.offsetHeight;
  if (!w || !h) return;

  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const B = Math.max(24, Math.min(w * 0.07, 72));

  const corners = [
    `M0 ${B} L0 0 L${B} 0`,
    `M${w - B} 0 L${w} 0 L${w} ${B}`,
    `M${w} ${h - B} L${w} ${h} L${w - B} ${h}`,
    `M${B} ${h} L0 ${h} L0 ${h - B}`,
  ];
  const dims = [
    `M${B + 16} 15 L${w - B - 16} 15`,
    `M${B + 16} 10 L${B + 16} 20`,
    `M${w - B - 16} 10 L${w - B - 16} 20`,
    `M15 ${B + 16} L15 ${h - B - 16}`,
    `M10 ${B + 16} L20 ${B + 16}`,
    `M10 ${h - B - 16} L20 ${h - B - 16}`,
  ];

  svg.innerHTML =
    corners
      .map(
        (d) =>
          `<path d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`,
      )
      .join("") +
    dims
      .map(
        (d) =>
          `<path class="dim" d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`,
      )
      .join("");
}

function drawFrame(svg: SVGSVGElement, instant: boolean) {
  svg.querySelectorAll<SVGPathElement>("path").forEach((path, i) => {
    path.style.transition = instant
      ? "none"
      : `stroke-dashoffset .9s cubic-bezier(.16,1,.3,1) ${i * 60}ms`;
    path.style.strokeDashoffset = "0";
  });
}

export function WorkLive() {
  const done = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    /* ── the plotted flow diagram ─────────────────────────────────── */
    const plotCanvas = document.querySelector<HTMLCanvasElement>("canvas.plot");
    if (plotCanvas) {
      const plotter = createPlotter(plotCanvas, {
        plan: testRidePlan,
        reduced,
        base: 0.8,
        hold: 300,
      });
      cleanups.push(plotter.destroy);
    }

    /* ── the drawn plate frames ───────────────────────────────────── */
    const frames = Array.from(document.querySelectorAll<SVGSVGElement>(".pl__f"));
    const drawn = new WeakSet<SVGSVGElement>();

    const layout = () => {
      for (const svg of frames) {
        frameFor(svg);
        /* a frame already revealed must come back finished, not replay */
        if (drawn.has(svg)) drawFrame(svg, true);
      }
    };

    const sweepFrames = () => {
      const h = window.innerHeight;
      for (const svg of frames) {
        if (drawn.has(svg)) continue;
        const wp = svg.closest(".wp");
        if (!wp) continue;
        const r = wp.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) {
          drawn.add(svg);
          drawFrame(svg, reduced);
        }
      }
    };

    layout();
    /* the plates are next/image; their boxes are only true once the
       images have decoded, so the frames are measured again after */
    const settle = setTimeout(() => {
      layout();
      sweepFrames();
    }, 300);
    cleanups.push(() => clearTimeout(settle));

    let rz: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(layout, 240);
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    });

    /* ── the index rail tracks the project you are in ─────────────── */
    const rail = document.querySelector<HTMLElement>(".idx");
    const items = Array.from(document.querySelectorAll<HTMLAnchorElement>(".idx a"));
    const projects = Array.from(document.querySelectorAll<HTMLElement>(".wp"));

    const track = () => {
      sweepFrames();
      if (!rail || !items.length) return;
      const mid = window.innerHeight * 0.5;
      let active = -1;
      projects.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) active = i;
      });
      items.forEach((a, i) => a.classList.toggle("on", i === active));
      rail.classList.toggle("lit", active >= 0);
    };

    cleanups.push(onScroll(track));
    done.current = true;

    return () => {
      for (const fn of cleanups) fn();
    };
  }, []);

  return null;
}
