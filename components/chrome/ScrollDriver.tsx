"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { publish } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    LENIS — PART 8.1, the single biggest perceptual upgrade.

    Every instrument on the page reads the smoothed position published
    here rather than window.scrollY. If they read the native value they
    lag the visible page by however far Lenis has interpolated ahead,
    and the spine marker, the dial and the maze all drift out of step
    with the content they are measuring.

    Anchors go through lenis.scrollTo — native anchor jumps fight the
    interpolation and land in the wrong place.

    Skipped entirely under reduced motion, where the native scroll is
    published instead.
    ═══════════════════════════════════════════════════════════════════ */

export function ScrollDriver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      let last = window.scrollY;
      let ticking = false;
      const read = () => {
        const y = window.scrollY;
        publish(y, document.documentElement.scrollHeight - window.innerHeight, y - last);
        last = y;
        ticking = false;
      };
      const onNative = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(read);
        }
      };
      read();
      window.addEventListener("scroll", onNative, { passive: true });
      window.addEventListener("resize", onNative);
      return () => {
        window.removeEventListener("scroll", onNative);
        window.removeEventListener("resize", onNative);
      };
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", (e: { scroll: number; limit: number; velocity: number }) => {
      publish(e.scroll, e.limit, e.velocity);
    });

    let raf = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    });

    /* anchors, routed through the interpolation */
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    /* the document grows as images decode and reveals fire */
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      ro.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}

