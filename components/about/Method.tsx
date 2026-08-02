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

    ── why this is a canvas and not a <video> ───────────────────────
    It was a <video> with `currentTime` driven off the scroll position,
    which is the usual way to do this and did not work: the element
    moved down the page with the sticky column but the picture never
    changed. Setting `currentTime` on a paused, never-played video only
    requests a seek — the browser is free to defer the decode, and with
    no play() ever issued the decoder was never primed, so the poster
    simply stayed up. Priming it with a muted play()/pause() trades that
    for a different bug: a real seek per frame, which is asynchronous,
    so fast scrolling queues seeks it then drops.

    So there is no decoder in the loop at all. The clip is decoded ahead
    of time into 33 WebP stills, and scrubbing is one drawImage of an
    already-decoded bitmap. It cannot fall behind the scroll, cannot
    stall, and cannot show a stale frame. 33 frames over 900px wide is
    ~900KB — less than a second on any connection the rest of this page
    already assumes, and it is fetched lazily, only once the section is
    within a screen of the viewport.

    ── how it sits in the page ──────────────────────────────────────
    It is a plate, not an embed: drawn corner brackets in the same
    language as the work plates, a graticule, and a soft-edged mask so
    the rectangle melts into the void instead of butting against it.
    The clip is a dark room with warm lamp light in it, which is the
    sentence the palette has been making since the home page.
    ═══════════════════════════════════════════════════════════════════ */

const FRAMES = 33;
const src = (i: number) =>
  `/about/frames/f${String(i + 1).padStart(3, "0")}.webp`;

export function Method() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const g = canvas.getContext("2d", { alpha: false });
    if (!g) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps = section.querySelector<HTMLElement>(".mt__steps");
    const stages = about.method.steps.map((s) => s.title.toUpperCase());

    /* ═══ the film ════════════════════════════════════════════════ */
    const film: (HTMLImageElement | null)[] = new Array(FRAMES).fill(null);
    let drawn = -1;

    const load = (i: number) =>
      new Promise<void>((done) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          film[i] = img;
          /* the first frame that arrives paints immediately, so the
             plate is never an empty rectangle */
          if (drawn < 0) render(true);
          done();
        };
        img.onerror = () => done();
        img.src = src(i);
      });

    /*  Frame 0 first and alone — it is the resting image and the only
        one needed until the visitor actually starts scrubbing. The rest
        follow four at a time so the strip never monopolises the
        connection while the page below is still loading. */
    let cancelled = false;
    const fetchFilm = async () => {
      await load(0);
      let next = 1;
      const lane = async () => {
        while (!cancelled && next < FRAMES) await load(next++);
      };
      await Promise.all([lane(), lane(), lane(), lane()]);
    };

    /*  PART 7.4 — nothing is fetched for a plate nobody is near. Kicks
        off once the section is within a screen of the viewport, off the
        same scroll store as everything else rather than an
        IntersectionObserver, which is one fewer thing to fall out of
        step with the rest of the instrumentation. */
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      fetchFilm();
    };
    const maybeFetch = () => {
      if (started) return;
      const r = section.getBoundingClientRect();
      if (r.top > window.innerHeight * 2 || r.bottom < -window.innerHeight) return;
      begin();
    };

    /*  …but proximity must not be the ONLY trigger. The check above only
        re-runs when the scroll store publishes, so a visitor who lands
        on /about and never scrolls — or any environment where the
        publisher is quiet — would leave the plate an empty rectangle
        forever. The idle pass guarantees the film arrives regardless,
        and arriving early is the better failure anyway: the frames are
        decoded before the visitor reaches the section rather than
        during it. */
    /*  `"x" in window` narrows window itself, which leaves the else
        branch typed `never` — so the capability check is held in a
        plain local instead. */
    const canIdle = typeof window.requestIdleCallback === "function";
    const idle = canIdle
      ? window.requestIdleCallback(begin, { timeout: 2500 })
      : window.setTimeout(begin, 1200);

    /* ═══ geometry ════════════════════════════════════════════════ */
    let dpr = 1;
    const size = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      drawn = -1; // backing store is cleared by the resize
      render(true);
    };
    /* the plate is fluid and the sticky column changes height at the
       1000px breakpoint — observe the box, do not trust window resize */
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    /** draws frame `i` with object-fit: cover semantics */
    const paint = (i: number) => {
      const img = film[i];
      if (!img) return false;
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return false;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = i;
      return true;
    };

    /*  Never leave a hole. If the exact frame has not landed yet, the
        nearest one that has is drawn instead, so scrubbing ahead of the
        download degrades to a slightly coarser film rather than a
        blank plate or a frozen one. */
    const render = (force = false) => {
      let i = Math.round(shown * (FRAMES - 1));
      i = Math.max(0, Math.min(FRAMES - 1, i));
      if (i === drawn && !force) return;
      if (paint(i)) return;
      for (let d = 1; d < FRAMES; d++) {
        if (i - d >= 0 && paint(i - d)) return;
        if (i + d < FRAMES && paint(i + d)) return;
      }
    };

    /* ═══ progress ════════════════════════════════════════════════ */
    /*  Everything in document coordinates. Mixing a viewport-relative
        top with a scroll offset — which the first version did — made
        the run collapse into a few hundred pixels, so the clip hit its
        last frame long before "Hand over" arrived.

        It starts when the section's top reaches the top of the viewport
        and ends the moment the last step's centre reaches the centre of
        the viewport — which, since the CSS was retuned, is also the
        exact scroll position at which the sticky plate releases. The
        final frame, the final sentence and the end of the pin all land
        together. */
    const progress = () => {
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

    /* ═══ where the pin lets go ═══════════════════════════════════
        The plate stops travelling when the grid row ends. For it to
        stop ON "Hand over" rather than below it, the row has to end at
        the scroll position where the last step is centred — so the
        row's bottom must sit half a plate below the last step's centre.

        row = lastStepCentre + plateH/2
            = (steps − lastH/2) + plateH/2
        i.e. the steps column needs trimming by (lastH − plateH)/2,
        which is almost always a few tens of pixels of negative margin.
        Measured rather than guessed, because both terms move with the
        viewport. Mobile has no pin, so it gets nothing. */
    const viz = section.querySelector<HTMLElement>(".mt__viz");
    const fitTail = () => {
      if (!steps || !viz) return;
      const last = steps.lastElementChild as HTMLElement | null;
      if (!last) return;
      if (!window.matchMedia("(min-width: 1000px)").matches) {
        steps.style.removeProperty("--mt-tail");
        viz.style.removeProperty("--mt-half");
        return;
      }
      /*  Half the plate's real height, so the pin parks it on the
          viewport's centre line rather than 22px above it. */
      const plateH = viz.offsetHeight;
      viz.style.setProperty("--mt-half", `${(plateH / 2).toFixed(1)}px`);
      steps.style.setProperty(
        "--mt-tail",
        `${Math.round((plateH - last.offsetHeight) / 2)}px`,
      );
    };

    let target = 0;
    let shown = 0;
    let raf = 0;

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
      maybeFetch();
      target = progress();
      /* under reduced motion the clip holds its first frame and only
         the readout follows the reading position */
      if (reduced) readout(target);
    });
    fitTail();
    target = progress();
    readout(target);
    maybeFetch();
    size();

    /* the steps reflow with the faces and with the viewport, and the
       tail is measured off them */
    const reflow = new ResizeObserver(() => {
      fitTail();
      target = progress();
    });
    if (steps) reflow.observe(steps);
    document.fonts?.ready.then(fitTail);

    if (!reduced) {
      shown = target;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        /* eased, not snapped — a wheel flick should arrive, not jump */
        const d = target - shown;
        if (Math.abs(d) < 0.0004) {
          if (shown !== target) {
            shown = target;
            render();
            readout(shown);
          }
          return;
        }
        shown += d * 0.14;
        render();
        readout(shown);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (canIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      ro.disconnect();
      reflow.disconnect();
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
        <div className="mt__col">
          <div className="mt__viz">
            <div className="mt__plate">
              <canvas ref={canvasRef} className="mt__video" aria-hidden="true" />
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
