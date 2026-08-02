"use client";

import { useEffect, useRef } from "react";
import { onScroll } from "@/lib/scroll";
import { about } from "@/content/about";

/*  ═══════════════════════════════════════════════════════════════════
    THE METHOD — a scroll-scrubbed plate.

    The point-cloud visualisation is gone. In its place the studio clip
    runs on the scroll wheel: the frame the visitor sees is a pure
    function of how far they have read, so scrolling forward advances
    it, scrolling back rewinds it, and stopping stops it dead. Nothing
    autoplays and nothing loops.

    ── how it stays in sync ─────────────────────────────────────────
    The file is re-encoded with every frame a keyframe (-g 1). A normal
    GOP makes `currentTime` seeking hunt for the nearest I-frame, which
    is what makes most scroll-scrubbed video stutter. All-keyframe at
    1280 wide costs 1.5MB and lands exactly on the requested frame.

    The seek is issued from the same Lenis position every other
    instrument reads, and eased toward rather than snapped to, so a
    flick of the wheel arrives smoothly instead of jumping.

    ── how it sits in the page ──────────────────────────────────────
    It is a plate, not an embed: drawn corner brackets in the same
    language as the work plates, a graticule, and a soft-edged mask so
    the rectangle melts into the void instead of butting against it.
    The clip is a dark room with warm lamp light in it, which is the
    sentence the palette has been making since the home page.
    ═══════════════════════════════════════════════════════════════════ */

export function Method() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps = section.querySelector<HTMLElement>(".mt__steps");
    const stages = about.method.steps.map((s) => s.title.toUpperCase());

    /*  Progress runs from the section arriving to the LAST STEP reaching
        centre screen, so the clip finishes exactly on "Hand over" rather
        than somewhere past the end of the section. */
    const progress = () => {
      /*  Everything in document coordinates. Mixing a viewport-relative
          top with a scroll offset — which the first version did — made
          the run collapse into a few hundred pixels, so the clip hit its
          last frame long before "Hand over" arrived.

          It starts when the section's top reaches the top of the
          viewport and ends the moment the last step's centre reaches the
          centre of the viewport. The final frame and the final sentence
          land together. */
      const y = window.scrollY;
      const r = section.getBoundingClientRect();
      const sectionTop = r.top + y;
      const last = steps?.lastElementChild as HTMLElement | null;
      const endScroll = last
        ? last.getBoundingClientRect().top +
          y +
          last.offsetHeight * 0.5 -
          window.innerHeight * 0.5
        : sectionTop + r.height - window.innerHeight;
      const span = endScroll - sectionTop;
      if (span <= 8) return y >= sectionTop ? 1 : 0;
      return Math.max(0, Math.min(1, (y - sectionTop) / span));
    };

    let target = 0;
    let shown = 0;
    let raf = 0;
    let ready = false;
    let visible = true;

    const onMeta = () => {
      ready = true;
      video.currentTime = 0;
    };
    if (video.readyState >= 1) onMeta();
    else video.addEventListener("loadedmetadata", onMeta, { once: true });

    const readout = (p: number) => {
      const i = Math.min(stages.length - 1, Math.floor(p * stages.length));
      if (stageRef.current && stageRef.current.textContent !== stages[i]) {
        stageRef.current.textContent = stages[i];
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(2, "0")}%`;
      }
    };

    const stop = onScroll(() => {
      target = progress();
      /* under reduced motion the clip holds its first frame and only
         the readout follows the reading position */
      if (reduced) readout(target);
    });
    target = progress();
    readout(target);

    if (!reduced) {
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || !ready) return;
        /* eased, not snapped — a wheel flick should arrive, not jump */
        shown += (target - shown) * 0.14;
        const d = video.duration;
        if (!d || Number.isNaN(d)) return;
        const t = Math.max(0, Math.min(d - 0.001, shown * d));
        if (Math.abs(video.currentTime - t) > 0.008) video.currentTime = t;
        readout(shown);
      };
      raf = requestAnimationFrame(tick);
    }

    /* PART 7.4 — do not decode frames for a plate nobody is looking at */
    const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting), {
      threshold: 0,
    });
    io.observe(video);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stop();
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
            <div className="mt__plate">
              <video
                ref={videoRef}
                className="mt__video"
                poster="/about/method-poster.jpg"
                preload="auto"
                muted
                playsInline
                disablePictureInPicture
                aria-hidden="true"
                tabIndex={-1}
              >
                <source
                  src="/about/method-720.mp4"
                  type="video/mp4"
                  media="(max-width: 860px)"
                />
                <source src="/about/method.mp4" type="video/mp4" />
              </video>
              <span className="mt__grat" aria-hidden="true" />
              <span className="mt__edge" aria-hidden="true" />
              <span className="mt__frame" aria-hidden="true">
                <i className="mt__c mt__c--tl" />
                <i className="mt__c mt__c--tr" />
                <i className="mt__c mt__c--br" />
                <i className="mt__c mt__c--bl" />
              </span>
            </div>
          </div>
          <div className="mt__read">
            <span ref={stageRef}>{about.method.steps[0].title.toUpperCase()}</span>
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
