import type { Metadata } from "next";
import Link from "next/link";
import { StaticField } from "@/components/canvas/StaticField";
import { notFound } from "@/content/contact";
import { site, stations } from "@/content/site";
import { heatPair } from "@/lib/ramp";

/*  ═══════════════════════════════════════════════════════════════════
    /404 — heat held cold at 0.00. PART 2.2, PART 5.6.

    PART 8.3 — the field here is scattered and unable to converge; it
    aligns only as the page transitions away. Stage 1 states the
    scattered condition: the convergence point is pushed far outside
    the frame, so every segment points at something it cannot reach.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/404"];

export const metadata: Metadata = {
  title: notFound.h1,
  description: notFound.line,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div style={heatPair(station.from)}>
      <section className="nf">
        <StaticField plate="not-found" />
        <div className="top__v" />

        <div className="relative z-3">
          <span className="lb lb--h">{notFound.label}</span>
          <h1 className="nf__h">{notFound.h1}</h1>
          <p className="top__lead">{notFound.line}</p>
          <div className="end__r edge-t">
            <Link className="mail" href="/">
              {notFound.link}
            </Link>
            <span className="lb">{site.where}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
