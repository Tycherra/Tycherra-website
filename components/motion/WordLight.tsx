"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    WORD-BY-WORD LIGHTING — PART 8.3, on both statement lines.

    Words sit at .12 and come to full as they cross 62% of the viewport
    height, and fall back on the way up.

    ── why nothing but this file may set a word's opacity ───────────
    The previous version left the .12 resting state in the stylesheet
    and ran in useEffect. That produced a three-stage flicker on the
    gradient clause, on every load:

      1. the raw sentence paints at full opacity, because the <w>
         wrappers do not exist until JavaScript has split it
      2. the wrappers appear and the stylesheet drops them to .12 —
         visibly, because that rule carries a .5s transition
      3. the driver measures and raises whatever is already past the
         line

    So the split and the first measurement both happen in a LAYOUT
    effect, before the browser paints, and the resting .12 is written
    inline by the same code that writes every later value. No
    stylesheet touches a word's opacity, and the transition is
    suppressed on the corrective passes so nothing animates out of a
    state the visitor was never meant to see.
    ═══════════════════════════════════════════════════════════════════ */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  useIsoLayoutEffect(() => {
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
            /* the resting state, written where every other value is */
            el.style.opacity = "0.12";
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

    /** `settle` = correct the state without animating into it */
    const paint = (settle = false) => {
      const line = window.innerHeight * 0.62;
      if (settle) for (const el of words) el.style.transition = "none";
      for (const el of words) {
        /* read and write in the same pass — no cached geometry */
        el.style.opacity = el.getBoundingClientRect().top < line ? "1" : "0.12";
      }
      if (settle) {
        void q.offsetHeight; // flush before handing the transition back
        for (const el of words) el.style.transition = "";
      }
    };

    /* before the browser's first paint — the point of the layout effect */
    paint(true);

    const stop = onScroll(() => paint());
    /* the faces land after first paint and move every word with them */
    document.fonts.ready.then(() => paint(true));
    const onResize = () => paint(true);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
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
