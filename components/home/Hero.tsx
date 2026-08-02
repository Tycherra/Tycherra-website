"use client";

import { useEffect, useRef } from "react";
import { createField, type FieldApi } from "@/lib/field-engine";
import { createSchematic } from "@/lib/schematic-engine";
import { ramp } from "@/lib/ramp";
import { onScroll } from "@/lib/scroll";
import { home } from "@/content/home";

/*  ═══════════════════════════════════════════════════════════════════
    THE HOME HERO — the active page. PART 4.1.

    Everything on this surface is one shot. The field canvas runs from
    the first frame; the loader is a blurred scrim over that same
    running animation, not a separate screen, so the page does not cut
    in — it dissolves.

    This component owns:
      · the live bearing field and its nine behaviours (lib/field-engine)
      · the schematic plate and its plotted alphabet (lib/schematic-engine)
      · the light lens over the headline
      · the loader
      · the live BEARING and NODES readouts

    Readouts and the lens are written straight to the DOM through refs.
    Sixty state updates a second would re-render the tree sixty times a
    second for two strings and a font axis.
    ═══════════════════════════════════════════════════════════════════ */

const BOOT_KEY = "tycherra:booted";

/*  PART 4.1 — the loader runs once per session, and the flag is read
    in the effect rather than from a script that runs before paint.

    The pre-paint version worked, but it had to stamp an attribute onto
    <html> that React had not rendered, which is a permanent hydration
    fault on every same-session load — and `suppressHydrationWarning`
    only papers over children, not attributes. What that bought was
    avoiding a single frame of scrim on a warm reload. One frame is not
    worth a standing hydration mismatch, so the scrim is dismissed on
    the first commit after hydration instead, with its transition
    suppressed so it does not fade out over a page the visitor has
    already seen. */

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const schemRef = useRef<HTMLCanvasElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const serRef = useRef<HTMLSpanElement>(null);
  const bearingRef = useRef<HTMLElement>(null);
  const nodesRef = useRef<HTMLElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = fieldRef.current;
    const inner = innerRef.current;
    if (!hero || !canvas || !inner) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    /* ═══ the field ═══════════════════════════════════════════════ */
    const field: FieldApi = createField({
      canvas,
      host: hero,
      typeSelector: ".h1 .mask > span, .h1 .h1__ser, .hero__s, .hero__in > .lb",
      reduced,
      onReadout(bearing, nodes) {
        if (bearingRef.current) bearingRef.current.textContent = bearing;
        if (nodesRef.current) nodesRef.current.textContent = nodes;
      },
    });
    cleanups.push(field.destroy);

    /* PART 7.3 — never measure before the faces have swapped in, or the
       boxes describe the fallback's metrics and the field bends around
       type that is no longer there. */
    document.fonts.ready.then(() => field.measure());

    /* ═══ the schematic plate ═════════════════════════════════════ */
    if (schemRef.current) {
      const schem = createSchematic(schemRef.current, reduced);
      cleanups.push(schem.destroy);
    }

    /* ═══ 9 · scroll handoff into the spine ═══════════════════════ */
    cleanups.push(
      onScroll(({ y }) => {
        field.setExit(Math.min(1, y / (window.innerHeight * 0.85)));
      }),
    );

    /* ═══ 10 / 12 · the light lens ════════════════════════════════
       The cursor is a light source moving across the headline. Under
       it the grotesque gains weight, warms toward amber and lifts; the
       serif line's gradient hotspot tracks the cursor along its length
       instead, because Instrument Serif has no weight axis to move.
       One idea, two expressions.
       ═══════════════════════════════════════════════════════════ */
    if (fine && !reduced) {
      const line1 = line1Ref.current;
      const ser = serRef.current;
      if (line1) {
        /*  Idempotent on purpose. A space becomes an empty <i> holding
            only a width, so reading textContent back off an already
            split line returns the words run together — and StrictMode
            invokes this effect twice in development. Splitting that
            second reading is how "Nothing here is" becomes
            "Nothinghereis". The source string is kept on the node. */
        const txt = (line1.dataset.text ??= line1.textContent ?? "");
        line1.textContent = "";
        for (const ch of txt) {
          const i = document.createElement("i");
          i.className = "gl";
          if (ch === " ") i.style.width = ".26em";
          else i.textContent = ch;
          line1.appendChild(i);
        }
        const glyphs = Array.from(line1.querySelectorAll<HTMLElement>(".gl"));

        let mx = -9999;
        let my = -9999;
        let raf: number | null = null;

        const paint = () => {
          raf = null;
          const R = 132;

          for (const el of glyphs) {
            const r = el.getBoundingClientRect();
            if (!r.width && !r.height) continue;
            /* measured to the glyph's box, not its centre, so tall
               letterforms respond across their height rather than only
               at the middle */
            const dx = Math.max(r.left - mx, 0, mx - r.right);
            const dy = Math.max(r.top - my, 0, my - r.bottom);
            const d = Math.hypot(dx, dy);
            const k = Math.max(0, 1 - d / R);
            const e = k * k * k; // a pool, not a wash

            /*  No weight modulation. The heading is set at 800 and the
                lens used to write `wght 400` into every glyph on the
                first pointermove, so the whole line visibly dropped to a
                lighter cut the moment the cursor moved. The resting
                state has to be the state it loads in. Warmth and lift
                carry the lens instead — they start from nothing, so
                there is no jump to make. */
            el.style.transform = `translateY(${(-e * 7).toFixed(2)}px)`;
            if (e > 0.01) {
              const c = ramp(0.42 + e * 0.55);
              el.style.color = `rgb(${c[0]},${c[1]},${c[2]})`;
              el.style.opacity = "1";
            } else {
              el.style.color = "";
            }
          }

          /* 12 — the serif: move the gradient hotspot to the cursor,
             and hold the idle sweep while it is being driven by hand */
          if (ser) {
            const r = ser.getBoundingClientRect();
            const inside =
              my > r.top - R * 0.5 &&
              my < r.bottom + R * 0.5 &&
              mx > r.left - R * 0.5 &&
              mx < r.right + R * 0.5;
            if (inside) {
              const rel = Math.max(0, Math.min(1, (mx - r.left) / r.width));
              ser.classList.add("lit");
              ser.style.backgroundPosition = `${(rel * 100).toFixed(1)}% 50%`;
            } else {
              ser.classList.remove("lit");
              ser.style.backgroundPosition = "";
            }
          }
        };

        const onMove = (e: PointerEvent) => {
          mx = e.clientX;
          my = e.clientY;
          if (raf === null) raf = requestAnimationFrame(paint);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          if (raf !== null) cancelAnimationFrame(raf);
        });
      }
    }

    /* ═══ 31 · the loader, as one continuous shot ═════════════════ */
    const boot = bootRef.current;
    let already = false;
    try {
      already = sessionStorage.getItem(BOOT_KEY) === "1";
    } catch {
      /* private mode — the loader simply runs again */
    }
    if (already || reduced) boot?.classList.add("instant");

    const finish = () => {
      boot?.classList.add("off");
      inner.classList.add("on");
      hero.classList.add("lit");
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* private mode — the loader simply runs again */
      }
    };

    if (reduced || already) {
      field.warm(1);
      field.release();
      finish();
    } else {
      /* the scrim clears as the real assets land, with a floor so it
         cannot flash past and a ceiling so it can never hang */
      let assetsReady = false;
      const settle = () => {
        assetsReady = true;
      };
      Promise.race([
        Promise.all([
          document.fonts.ready,
          ...Array.from(document.images).map((img) =>
            img.complete ? Promise.resolve() : img.decode().catch(() => {}),
          ),
        ]),
        new Promise((r) => setTimeout(r, 3000)),
      ]).then(settle);

      let p = 0;
      let bootRaf = requestAnimationFrame(function step() {
        /* hold just short of complete until the assets are in */
        const ceiling = assetsReady ? 1 : 0.92;
        p = Math.min(ceiling, p + 0.0125);
        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
        field.warm(p * 0.62);
        if (statusRef.current) {
          statusRef.current.textContent =
            p > 0.88 ? "READY" : p > 0.5 ? "ALIGNING" : "FINDING BEARING";
        }
        if (p < 1) {
          bootRaf = requestAnimationFrame(step);
        } else {
          finish();
          let k = 0.62;
          bootRaf = requestAnimationFrame(function bloom() {
            k = Math.min(1, k + 0.012);
            field.warm(k);
            if (k < 1) bootRaf = requestAnimationFrame(bloom);
            else field.release();
          });
        }
      });
      cleanups.push(() => cancelAnimationFrame(bootRaf));
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, []);

  return (
    <>
      {/* the loader is an overlay on the live field, not a screen */}
      <div className="boot" ref={bootRef} aria-hidden="true">
        <div className="boot__ui">
          <span className="boot__w">Tycherra°</span>
          <span className="boot__s" ref={statusRef}>
            FINDING BEARING
          </span>
          <div className="boot__bar">
            <i ref={barRef} />
          </div>
        </div>
      </div>

      <section className="hero" id="top" ref={heroRef}>
        <canvas id="field" ref={fieldRef} aria-hidden="true" />
        <div className="hero__v" />

        <div className="hud hud--l">
          <span>{home.hero.hud.left.label}</span>
          <b ref={bearingRef}>{home.hero.hud.left.value}</b>
        </div>
        <div className="hud hud--r">
          <span>{home.hero.hud.right.label}</span>
          <b ref={nodesRef}>{home.hero.hud.right.value}</b>
        </div>

        {/* the schematic. Its caption is drawn by the plotting head —
            there is deliberately no text element here. */}
        <div className="plate" aria-hidden="true">
          <canvas ref={schemRef} />
        </div>

        <div className="hero__in" id="hin" ref={innerRef}>
          <span className="lb lb--h" data-decode>
            {home.hero.label}
          </span>
          <h1 className="hd h1">
            {/* 13 — line one takes the mask, line two the clip wipe.
                Never swapped: background-clip:text breaks the moment a
                child span of the serif line is transformed. */}
            <span className="mask">
              <span ref={line1Ref}>{home.hero.h1.line}</span>
            </span>
            <span className="h1__ser wipe" ref={serRef}>
              {home.hero.h1.serif}
            </span>
          </h1>
          <div className="hero__b edge-t">
            <p className="hero__s">{home.hero.lead}</p>
            <span className="cue">
              <i aria-hidden="true" />
              <span className="lb">Click to hold bearing</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

