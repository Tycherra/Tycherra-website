"use client";

import { useEffect, useState } from "react";

/*  PART 7.7 — prefers-reduced-motion gates everything: no canvas loops,
    no decode, no trail, no maze, static hero, sticky released.

    Returns null until mounted so nothing renders differently on the
    server than it does on the first client pass. */
export function useReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  return reduced;
}

/** `pointer: fine` only. Never on touch — PART 3.3. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setFine(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  return fine;
}
