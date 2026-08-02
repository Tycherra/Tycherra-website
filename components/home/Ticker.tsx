"use client";

import { useEffect, useRef } from "react";
import { onScroll } from "@/lib/scroll";
import { home } from "@/content/home";

/*  ═══════════════════════════════════════════════════════════════════
    28 · THE TICKER — moves continuously, and scroll velocity drives it.
    Three copies so the wrap is seamless; the offset resets by exactly
    one copy's width, so the reset is invisible.
    ═══════════════════════════════════════════════════════════════════ */

export function Ticker() {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let off = 0;
    let boost = 0;
    const base = 0.4;

    const stop = onScroll(({ v }) => {
      boost = Math.min(4, Math.abs(v) * 0.09);
    });

    let raf = requestAnimationFrame(function f() {
      raf = requestAnimationFrame(f);
      boost *= 0.94;
      off -= base + boost;
      const lim = row.scrollWidth / 3;
      if (lim && -off >= lim) off += lim;
      row.style.transform = `translate3d(${off}px,0,0)`;
    });

    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }, []);

  return (
    <div className="tk" aria-hidden="true">
      <div className="tk__r" ref={rowRef}>
        {[0, 1, 2].map((k) => (
          <span key={k}>
            {home.ticker.map((word) => (
              <span key={word} className="contents">
                {word} <em>°</em>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

