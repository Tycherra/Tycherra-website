"use client";

import { useEffect, useRef } from "react";
import { createField } from "@/lib/field-engine";

/*  ═══════════════════════════════════════════════════════════════════
    /404 — the same live engine as the home hero, with nothing to find.

    PART 8.3: the field is scattered and unable to converge. It is not
    a still image of a scattered field — it runs, and it keeps running,
    and it never arrives. That is the page's whole argument, and a
    static plate cannot make it.
    ═══════════════════════════════════════════════════════════════════ */

export function ScatterField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const field = createField({
      canvas,
      host,
      typeSelector: ".nf__h, .top__lead, .nf .lb",
      reduced,
      scatter: true,
    });

    /* nothing gates the reveal here — there is no loader on /404 */
    field.warm(1);
    document.fonts.ready.then(() => field.measure());

    return field.destroy;
  }, []);

  return (
    <div className="nf__field" ref={hostRef} aria-hidden="true">
      <canvas id="field" ref={canvasRef} />
    </div>
  );
}

