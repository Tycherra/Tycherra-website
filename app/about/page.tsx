import type { Metadata } from "next";
import Link from "next/link";
import { Method } from "@/components/about/Method";
import { Cursor } from "@/components/chrome/Cursor";
import { Instruments } from "@/components/chrome/Instruments";
import { ScrollDriver } from "@/components/chrome/ScrollDriver";
import { Reveal } from "@/components/motion/Reveal";
import { WordLight } from "@/components/motion/WordLight";
import { Bloom } from "@/components/ui/Bloom";
import { about } from "@/content/about";
import { site, stations } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    /about — THE METHOD. Heat 0.62 → 0.80, reads orange.

    PART 4.3 — the moving bearing field is deliberately not ported.
    Static header, more air, same treatment as Work.

    The signature stays and is live: one set of a hundred and fifty
    points rearranging through SCATTER → CLUSTER → LATTICE → SYSTEM,
    driven by scroll position inside a sticky container with real
    travel, with the state readout beneath it.

    Copy is PART 5.4 as revised — the lead no longer carries "small on
    purpose", which is now its own section, and the meta strip has lost
    the headcount and the weekday range.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/about"];

export const metadata: Metadata = {
  title: "About",
  description: about.lead,
  alternates: { canonical: "/about" },
  openGraph: { title: `About — ${site.mark}`, description: about.lead },
};

export default function AboutPage() {
  return (
    <>
      <ScrollDriver />
      <Instruments from={station.from} to={station.to} lead={0.16} seed={613} />
      <Cursor heroSelector=".hero" />
      <Reveal />

      <header className="top top--air" id="top">
        <Bloom p={0.68} x={{ right: "-6vw" }} y="24%" w="42vw" max="580px" />
        <div className="top__v" />

        <div className="hud hud--l">
          <span>{about.hud.left.label}</span>
          <b>{about.hud.left.value}</b>
        </div>
        <div className="hud hud--r">
          <span>{about.hud.right.label}</span>
          <b>{about.hud.right.value}</b>
        </div>

        <div className="top__in">
          <span className="lb lb--h" data-decode>
            {about.label}
          </span>
          {/* the one character-rise heading on this page — PART 2.5 C */}
          <h1 className="top__h" data-chars>
            {about.h1}
          </h1>
          <p className="top__lead up">{about.lead}</p>
          <div className="top__m up edge-t">
            {about.meta.map((m) => (
              <span key={m} className="lb">
                {m}
              </span>
            ))}
            <span className="cue">
              <i aria-hidden="true" />
              <span className="lb">{about.cue}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── the statement ── */}
      <section className="section section--air">
        <Bloom p={0.6} x={{ left: "-15vw" }} y="-4%" w="66vw" max="900px" />
        <WordLight
          label={about.statement.label}
          lead={about.statement.lead}
          serif={about.statement.serif}
        />
      </section>

      {/* ── what's different ── */}
      <section className="section edge-t">
        <Bloom p={0.64} x={{ right: "-12vw" }} y="8%" w="48vw" max="660px" />
        <span className="lb up" data-decode>
          {about.different.label}
        </span>
        <p className="st__lead up">{about.different.body}</p>
      </section>

      {/* ── the method — live, scroll-driven ── */}
      <Method />

      {/* ── six principles ── */}
      <section className="section section--air edge-t">
        <Bloom p={0.72} x={{ left: "-16vw" }} y="6%" w="68vw" max="920px" />
        <span className="lb up" data-decode>
          {about.principles.label}
        </span>
        <h2 className="pr__h wipe">{about.principles.serif}</h2>
        <div className="pr__l">
          {about.principles.items.map((line, i) => (
            <div
              key={line}
              className={`pr__i skw edge-t${
                i === about.principles.items.length - 1 ? " edge-b" : ""
              }`}
            >
              <p>{line}</p>
              <span className="lb">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── what we don't do ── */}
      <section className="section edge-t">
        <h2 className="lb up" data-decode>
          {about.refusals.label}
        </h2>
        <div className="cards">
          {about.refusals.cards.map((c) => (
            <div key={c.n} className="card skw edge-t">
              <span className="lb">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── the close ── */}
      <section className="end edge-t">
        <Bloom
          p={0.78}
          x={{ right: "-19vw" }}
          y="-16%"
          w="84vw"
          max="1120px"
          ratio={84 / 72}
        />
        <span className="lb up" data-decode>
          {about.close.label}
        </span>
        <h2 className="end__h">
          <span className="mask">
            <span>{about.close.h2}</span>
          </span>
          <span className="mask">
            <span>
              <em>{about.close.serif}</em>
            </span>
          </span>
        </h2>
        <div className="end__r up edge-t">
          <Link className="mail" href="/contact" data-hv>
            {site.email}
          </Link>
          <span className="lb">{about.close.note}</span>
        </div>
      </section>
    </>
  );
}
