import type { Metadata } from "next";
import Link from "next/link";
import { Cursor } from "@/components/chrome/Cursor";
import { Instruments } from "@/components/chrome/Instruments";
import { ScrollDriver } from "@/components/chrome/ScrollDriver";
import { ScatterField } from "@/components/home/ScatterField";
import { notFound } from "@/content/contact";
import { site, stations } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    /404 — heat held cold at 0.00. PART 2.2, PART 5.6, PART 8.3.

    The field here runs the live engine in scatter mode: every segment
    keeps the heading it woke up with and drifts, the nodes never form,
    and the bearing ring is never drawn. It is not a picture of a
    scattered field — it is the field, failing to converge, for as long
    as you stay.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/404"];

export const metadata: Metadata = {
  title: notFound.h1,
  description: notFound.line,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <ScrollDriver />
      <Instruments from={station.from} to={station.to} seed={4041} />
      <Cursor heroSelector=".hero" />

      <section className="nf">
        <ScatterField />
        <div className="top__v" />

        <div className="relative z-3">
          <span className="lb lb--h">{notFound.label}</span>
          <h1 className="nf__h">{notFound.h1}</h1>
          <p className="top__lead">{notFound.line}</p>
          <div className="end__r edge-t">
            <Link className="mail" href="/" data-hv>
              {notFound.link}
            </Link>
            <span className="lb">{site.where}</span>
          </div>
        </div>
      </section>
    </>
  );
}
