"use client";

import { useEffect } from "react";
import { onScroll } from "@/lib/scroll";

/*  ═══════════════════════════════════════════════════════════════════
    THE FIVE TECHNIQUES — PART 2.5.
    Each owns one job. Never reused outside its role, never a sixth.

      A  .mask   line mask         primary headings          1.1s
      B  .wipe   clip + focus pull serif lines, titles       1.5s
      C  .chr    character rise    one heading per page      .95s
      D  .skw    skew settle       card and row groups       .85s
      E  decode  glyph scramble    mono labels only          30ms/frame

    Body copy takes .up — fade and 24px. That restraint is what makes
    the five read as decisions rather than as effects.

    One observer drives all of them. Elements arm themselves through
    class names and data attributes so the markup stays declarative and
    a server component can emit it.
    ═══════════════════════════════════════════════════════════════════ */

const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789°";

/** E — glyphs resolving into the string. Mono labels only. */
export function decode(el: HTMLElement) {
  const real = el.dataset.decodeText ?? el.textContent ?? "";
  el.dataset.decodeText = real;
  let n = 0;
  const id = setInterval(() => {
    el.textContent = real
      .split("")
      .map((c, i) =>
        i < n ? c : c === " " ? " " : CH[Math.floor(Math.random() * CH.length)],
      )
      .join("");
    n += 1.5;
    if (n >= real.length) {
      clearInterval(id);
      el.textContent = real;
    }
  }, 30);
  return () => clearInterval(id);
}

export function Reveal({ scope = "main" }: { scope?: string }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector(scope);
    if (!root) return;

    /* C — character rise. Split once, on mount. */
    root.querySelectorAll<HTMLElement>("[data-chars]").forEach((el) => {
      if (el.dataset.split === "1") return;
      el.dataset.split = "1";
      const text = el.textContent ?? "";
      el.textContent = "";
      /*  F2 — 38ms is the house stagger, but a long heading would push
          the run past the 1.2s ceiling. The delay is capped so the last
          character always starts within 240ms and the whole rise lands
          under 1.2s, whatever the heading says. */
      const step = Math.min(38, 240 / Math.max(1, text.length - 1));
      text.split("").forEach((c, i) => {
        if (c === " ") {
          el.appendChild(document.createTextNode(" "));
          return;
        }
        const span = document.createElement("span");
        span.className = "chr";
        span.style.transitionDelay = `${Math.round(i * step)}ms`;
        span.textContent = c;
        el.appendChild(span);
      });
    });

    if (reduced) {
      /* everything arrives already resolved */
      root
        .querySelectorAll(".up,.skw,.wipe,.mask,[data-chars],[data-reveal]")
        .forEach((el) => el.classList.add("on"));
      return;
    }

    const timers: (() => void)[] = [];
    const pending = new Set<HTMLElement>();

    const fire = (el: HTMLElement) => {
      if (!pending.delete(el)) return;
      el.classList.add("on");
      if (el.hasAttribute("data-decode")) timers.push(decode(el));
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) fire(e.target as HTMLElement);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".up,.skw,.wipe,[data-chars],[data-decode],[data-reveal],.end__h .mask",
      ),
    );

    targets.forEach((el, i) => {
      /* the hero runs on the loader's clock, not the observer's */
      if (el.closest(".hero")) return;
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      pending.add(el);
      io.observe(el);
    });

    /*  F2 — anything already on screen reveals on mount.

        Waiting on an IntersectionObserver for an element that is
        ALREADY in view costs a full observer delivery before the h1 so
        much as starts, which read as the heading taking seconds to
        appear. Above the fold is not a scroll event; it is the initial
        state. Below the fold still waits for the observer.

        This doubles as the safety net: an observer that never delivers
        would otherwise strand the page at opacity 0, and no reveal is
        worth that. */
    const sweep = () => {
      if (!pending.size) return;
      const h = window.innerHeight;
      for (const el of Array.from(pending)) {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) fire(el);
      }
    };

    sweep();
    const stopSweep = onScroll(sweep);
    const settle = setTimeout(sweep, 400);

    /* E — labels also decode on hover, as they do in the prototype */
    const hoverables = Array.from(
      root.querySelectorAll<HTMLElement>("[data-decode-hover]"),
    );
    const onEnter = (ev: Event) => timers.push(decode(ev.currentTarget as HTMLElement));
    for (const el of hoverables) el.addEventListener("mouseenter", onEnter);

    return () => {
      io.disconnect();
      stopSweep();
      clearTimeout(settle);
      for (const stop of timers) stop();
      for (const el of hoverables) el.removeEventListener("mouseenter", onEnter);
    };
  }, [scope]);

  return null;
}
