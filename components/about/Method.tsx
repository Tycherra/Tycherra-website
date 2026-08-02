"use client";

import { useEffect, useRef } from "react";
import { createMethod } from "@/lib/method-engine";
import { onScroll } from "@/lib/scroll";
import { about } from "@/content/about";

/*  ═══════════════════════════════════════════════════════════════════
    THE METHOD — the sticky container, and the driver behind it.

    Progress is the section's own travel: how far its top has moved
    above the viewport, over how far it can move. That is a pure
    function of scroll position, so it reverses exactly on the way back
    up — which a one-shot observer cannot do, and which is the whole
    point of a visualisation that argues by rearranging.

    PART 7.3 — the sticky element needs explicit travel, so .mt__steps
    carries min-height on desktop and none on mobile, and the grid
    column stretches so the sticky offset has the full row to work
    against.
    ═══════════════════════════════════════════════════════════════════ */

export function Method() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const method = createMethod(
      canvas,
      (name, pct) => {
        if (nameRef.current && nameRef.current.textContent !== name) {
          nameRef.current.textContent = name;
        }
        if (pctRef.current) pctRef.current.textContent = pct;
      },
      reduced,
    );

    /*  F3a — progress is measured against the LAST STEP, not the whole
        section. Measured against the section, SYSTEM only resolved once
        the footer of the block had scrolled by, which is well after
        "Hand over" has been read and gone. Now the run ends exactly as
        the last step reaches the middle of the screen, so the argument
        completes on the sentence that describes completion. */
    const steps = section.querySelector<HTMLElement>(".mt__steps");
    const progress = () => {
      const r = section.getBoundingClientRect();
      const last = steps?.lastElementChild as HTMLElement | null;
      const mid = window.innerHeight * 0.5;
      const start = r.top;
      const end = last
        ? last.getBoundingClientRect().top + last.offsetHeight * 0.5 - mid + start
        : r.height - window.innerHeight + start;
      const span = start - end;
      if (span <= 0) return r.top < 0 ? 1 : 0;
      return Math.max(0, Math.min(1, -r.top / span));
    };

    const stop = onScroll(() => method.setProgress(progress()));
    method.setProgress(progress());

    return () => {
      stop();
      method.destroy();
    };
  }, []);

  return (
    <section className="relative z-2 edge-t" id="method" ref={sectionRef}>
      <div className="mt__bar">
        <h2 className="lb" data-decode>
          {about.method.label}
        </h2>
        <span className="lb">{about.method.count}</span>
      </div>

      <div className="mt__wrap">
        <div>
          <div className="mt__viz">
            <canvas ref={canvasRef} aria-hidden="true" />
          </div>
          <div className="mt__read">
            <span ref={nameRef}>SCATTER</span>
            <b ref={pctRef}>00%</b>
          </div>
        </div>

        <div className="mt__steps">
          {about.method.steps.map((s) => (
            <article key={s.n} className="stp" data-reveal>
              <div className="stp__n">
                <span className="lb lb--h">{s.n}</span>
                <i aria-hidden="true" />
                <span className="lb">{s.verb}</span>
              </div>
              <h3 className="stp__t wipe">{s.title}</h3>
              <p className="stp__p">{s.body}</p>
              <div className="stp__r" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
