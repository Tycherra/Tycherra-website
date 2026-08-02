"use client";

import { useEffect, useRef } from "react";
import { ramp } from "@/lib/ramp";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    THE CURSOR — PART 3.3.

    26 · The reticle is confined to the home hero. An IntersectionObserver
    watches the hero; the moment it leaves the viewport the reticle fades
    over 250ms and the native cursor comes back. Running it site-wide is
    heavy and was the thing PART 3.3 called a fix, not a preference.

    27 · The charged trail is an easter egg and stays. Nothing happens on
    ordinary movement. Sustained fast strokes charge it — the line
    appears, and as you keep going it walks down the ramp toward deep
    red and burns brighter. Stop, and it discharges and disappears.

    pointer: fine only. Never on touch.
    ═══════════════════════════════════════════════════════════════════ */

export function Cursor({ heroSelector }: { heroSelector: string }) {
  const retRef = useRef<HTMLDivElement>(null);
  const degRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    const cleanups: (() => void)[] = [];

    /* ═══ 26 · the reticle ════════════════════════════════════════ */
    const ret = retRef.current;
    const deg = degRef.current;
    if (ret && deg) {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let cx = x;
      let cy = y;
      let inHero = false;

      /*  26 — the reticle is confined to the hero. Driven off the same
          scroll store as every other instrument rather than an
          IntersectionObserver: this is a single rect test that has to
          agree with the heat, the spine and the dial frame for frame,
          and reading it from the one publisher is both cheaper and
          impossible to get out of step. */
      const hero = document.querySelector(heroSelector);
      if (hero) {
        const sync = () => {
          const r = hero.getBoundingClientRect();
          const now = r.bottom > 0 && r.top < window.innerHeight;
          if (now === inHero) return;
          inHero = now;
          ret.classList.toggle("on", inHero);
        };
        cleanups.push(onScroll(sync));
        window.addEventListener("resize", sync);
        cleanups.push(() => window.removeEventListener("resize", sync));
      }

      const onMove = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        deg.textContent =
          String(
            Math.round(
              (Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) *
                57.2958 +
                450) %
                360,
            ),
          ).padStart(3, "0") + "°";
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let raf = requestAnimationFrame(function f() {
        cx += (x - cx) * 0.2;
        cy += (y - cy) * 0.2;
        ret.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        raf = requestAnimationFrame(f);
      });

      /* expands to VIEW over anything interactive */
      const over = () => document.body.classList.add("hv");
      const out = () => document.body.classList.remove("hv");
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("a,button,[data-hv]"),
      );
      for (const el of targets) {
        el.addEventListener("mouseenter", over);
        el.addEventListener("mouseleave", out);
      }

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        for (const el of targets) {
          el.removeEventListener("mouseenter", over);
          el.removeEventListener("mouseleave", out);
        }
        document.body.classList.remove("hv");
      });
    }

    /* ═══ 27 · the charged trail ══════════════════════════════════ */
    const cv = trailRef.current;
    if (cv && !reduced) {
      const g = cv.getContext("2d");
      if (g) {
        let pts: { x: number; y: number; l: number }[] = [];
        let lx: number | null = null;
        let ly = 0;
        let lt = 0;
        let charge = 0; // 0 dormant … 1 fully lit
        let swing = 0; // sustained fast movement, decays
        const MAX = 64;

        const size = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          cv.width = Math.round(window.innerWidth * dpr);
          cv.height = Math.round(window.innerHeight * dpr);
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();
        window.addEventListener("resize", size);

        const onMove = (e: PointerEvent) => {
          const now = performance.now();
          if (lx !== null) {
            const dt = Math.max(8, now - lt);
            const d = Math.hypot(e.clientX - lx, e.clientY - ly);
            const speed = (d / dt) * 16; // px per frame-equivalent
            /*  It is an easter egg, so it has to be genuinely hard to
                trip. The old gate — 26px/frame, building at .0075 —
                lit up on any brisk move across the page, which is
                exactly the thing PART 3.3 says it must not do.

                Now it takes a real swipe: nothing counts below 70px per
                frame-equivalent, the charge accrues about a third as
                fast, and it has to be sustained past 1.15 before a
                single pixel is drawn. One quick flick cannot reach it —
                only several strokes in a row can. */
            if (speed > 70) swing = Math.min(2.2, swing + (speed - 70) * 0.0026);
          }
          lx = e.clientX;
          ly = e.clientY;
          lt = now;
          if (charge > 0.02) {
            pts.push({ x: e.clientX, y: e.clientY, l: 1 });
            if (pts.length > MAX) pts.shift();
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        let raf = requestAnimationFrame(function f() {
          raf = requestAnimationFrame(f);
          g.clearRect(0, 0, window.innerWidth, window.innerHeight);

          /* and it discharges faster than it charges, so stopping
             clears it almost at once */
          swing *= 0.925;
          const target = swing > 1.15 ? Math.min(1, (swing - 1.15) / 0.75) : 0;
          charge += (target - charge) * (target > charge ? 0.05 : 0.12);
          if (charge < 0.02) {
            pts.length = 0;
            return;
          }

          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const k = i / pts.length;
            /* the ramp station climbs with charge: cool amber-ward at
               first, driving toward crimson as the strokes keep coming */
            const c = ramp(0.62 - charge * 0.34 + k * 0.3 * (1 - charge * 0.55));
            g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${k * k * a.l * 0.78 * charge})`;
            g.lineWidth = (0.4 + k * k * 2.6) * (0.5 + charge * 0.9);
            g.lineCap = "round";
            g.lineJoin = "round";
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
          }

          if (pts.length && charge > 0.25) {
            const hd = pts[pts.length - 1];
            const c = ramp(0.3 - charge * 0.22);
            g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${charge * 0.75})`;
            g.beginPath();
            g.arc(hd.x, hd.y, 1.1 + charge * 2.6, 0, Math.PI * 2);
            g.fill();
          }

          for (const p of pts) p.l *= 0.962;
          pts = pts.filter((p) => p.l > 0.04);
        });

        cleanups.push(() => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", size);
          window.removeEventListener("pointermove", onMove);
        });
      }
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [heroSelector]);

  return (
    <>
      <canvas id="trail" ref={trailRef} aria-hidden="true" />
      <div className="ret" ref={retRef} aria-hidden="true">
        <div className="ret__c">
          <svg viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="15" stroke="#fff" strokeWidth=".9" opacity=".45" />
            <circle cx="26" cy="26" r="1.4" fill="#fff" />
            <path
              d="M26 3v7M49 26h-7M26 49v-7M3 26h7"
              stroke="#fff"
              strokeWidth=".9"
              opacity=".7"
            />
          </svg>
          <span className="ret__a">VIEW</span>
        </div>
        <span className="ret__d" ref={degRef}>
          000°
        </span>
      </div>
    </>
  );
}

