"use client";

import { useEffect, useRef } from "react";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    WORD-BY-WORD LIGHTING — PART 8.3, on both statement lines.

    Words sit at .12 and come to full as they cross 62% of the viewport
    height, and fall back on the way up.

    Three things this gets right that the first build did not:

      · the serif clause is measured and driven exactly like every
        other word. The prototype pinned it to opacity 1 in CSS while
        the driver set inline opacity on it anyway, so the last word of
        the sentence arrived already lit, was pushed to .12 by the
        first paint, and lit again a moment later. On the single most
        important line of the page.
      · geometry is read on the same frame the opacity is written, from
        the Lenis position, so it can never act on a stale rect.
      · it re-measures once the faces have swapped in. Bricolage is a
        variable font arriving over the network; every word moves when
        it lands.
    ═══════════════════════════════════════════════════════════════════ */

export function WordLight({
  label,
  lead,
  serif,
}: {
  label: string;
  lead: string;
  serif: string;
}) {
  const qRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const q = qRef.current;
    if (!q) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*  Idempotent: StrictMode invokes effects twice, and re-splitting
        already-split markup would nest <w> inside <w>. */
    if (q.dataset.split !== "1") {
      q.dataset.split = "1";
      const walk = (n: Node) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          (n.textContent ?? "").split(/(\s+)/).forEach((tk) => {
            if (!tk.trim()) {
              frag.appendChild(document.createTextNode(tk));
              return;
            }
            const el = document.createElement("w");
            el.textContent = tk;
            frag.appendChild(el);
          });
          (n as ChildNode).replaceWith(frag);
        } else if (n.nodeType === 1) {
          Array.from(n.childNodes).forEach(walk);
        }
      };
      Array.from(q.childNodes).forEach(walk);
    }

    const words = Array.from(q.querySelectorAll<HTMLElement>("w"));

    if (reduced) {
      for (const el of words) el.style.opacity = "1";
      return;
    }

    const paint = () => {
      const line = window.innerHeight * 0.62;
      for (const el of words) {
        /* read and write in the same pass — no cached geometry */
        el.style.opacity = el.getBoundingClientRect().top < line ? "1" : "0.12";
      }
    };

    const stop = onScroll(paint);
    paint();

    /* the faces land after first paint and move every word with them */
    document.fonts.ready.then(paint);
    window.addEventListener("resize", paint);

    return () => {
      stop();
      window.removeEventListener("resize", paint);
    };
  }, []);

  return (
    <>
      <span className="lb" data-decode>
        {label}
      </span>
      <h2 className="st__q" ref={qRef}>
        {lead} <em>{serif}</em>
      </h2>
    </>
  );
}
