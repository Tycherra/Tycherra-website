import Link from "next/link";
import { Cursor } from "@/components/chrome/Cursor";
import { Instruments } from "@/components/chrome/Instruments";
import { ScrollDriver } from "@/components/chrome/ScrollDriver";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Reveal } from "@/components/motion/Reveal";
import { WordLight } from "@/components/motion/WordLight";
import { Bloom } from "@/components/ui/Bloom";
import { home } from "@/content/home";
import { site, stations } from "@/content/site";
import { projects } from "@/content/work";

/*  ═══════════════════════════════════════════════════════════════════
    / HOME — the active page. Heat 0.00 → 0.22. PART 4.1.

    This is the only page with the moving field. Everything from the
    v15 prototype ships: the bearing field with all its behaviours, the
    schematic plate with the plotted stroke alphabet, the loader as one
    continuous shot, word-by-word lighting on the statement, and the
    scroll-velocity ticker.

    The instrument panel and the cursor are mounted from here rather
    than from the root layout while the other three routes are still on
    the stage-1 shell. They lift into the layout when those routes are
    brought up to the same standard.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/"];

export default function HomePage() {
  return (
    <>
      <ScrollDriver />
      <Instruments from={station.from} to={station.to} seed={97} />
      <Cursor heroSelector=".hero" />
      <Reveal />

      <Hero />

      <Ticker />

      {/* ── the statement ── */}
      <section className="section">
        <Bloom p={0.04} x={{ left: "-13vw" }} y="0%" w="62vw" max="820px" />
        <Bloom p={0.16} x={{ right: "-6vw" }} y="44%" w="40vw" max="560px" />

        <WordLight
          label={home.statement.label}
          lead={home.statement.lead}
          serif={home.statement.serif}
        />

        <div className="st__g">
          {home.columns.map((col) => (
            <div key={col.label} className="st__c skw edge-t">
              <span className="lb">{col.label}</span>
              <p>{col.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── the work index — four entries, condensed, linking through ── */}
      <section className="section">
        <Bloom p={0.1} x={{ right: "-17vw" }} y="10%" w="68vw" max="920px" />
        <div className="flex flex-wrap items-baseline justify-between gap-4 up">
          <h2 className="lb" data-decode>
            {home.work.label}
          </h2>
          <span className="lb">{home.work.count}</span>
        </div>

        <div className="mt-[clamp(30px,5vh,56px)]">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/work#${p.id}`}
              data-hv
              className={`ji ji--${i + 1} up edge-t${
                i === projects.length - 1 ? " edge-b" : ""
              }`}
            >
              <span className="block">
                <span className="ji__x">
                  <span className="lb lb--h">{p.n}</span>
                  <span className="lb">
                    {p.kind} — {p.year}
                  </span>
                </span>
                <h3 className="ji__t mt-2">{p.name}</h3>
              </span>
              <span className="ji__d block">{p.line}</span>
            </Link>
          ))}
        </div>

        <div className="mt-[clamp(26px,4vh,44px)] up">
          <Link href="/work" className="lb lb--on ul">
            {home.work.all} →
          </Link>
        </div>
      </section>

      {/* ── what we build ── */}
      <section className="section">
        <Bloom p={0.18} x={{ left: "-15vw" }} y="6%" w="72vw" max="980px" />
        <span className="lb up" data-decode>
          {home.capability.label}
        </span>
        <h2 className="cp__h wipe">{home.capability.serif}</h2>

        <div className="cp__l">
          {home.capability.rows.map((row, i) => (
            <div
              key={row.title}
              className={`cp__r skw edge-t${
                i === home.capability.rows.length - 1 ? " edge-b" : ""
              }`}
            >
              <h3>{row.title}</h3>
              <p>{row.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── the close. The one character-rise heading on this page. ── */}
      <section className="end">
        <Bloom
          p={0.22}
          x={{ right: "-19vw" }}
          y="-8%"
          w="88vw"
          max="1200px"
          ratio={88 / 78}
        />
        <span className="lb up" data-decode>
          {home.close.label}
        </span>
        <h2 className="end__h">
          <span className="block" data-chars>
            {home.close.h2}
          </span>
          <span className="mask">
            <span>
              <em>{home.close.serif}</em>
            </span>
          </span>
        </h2>
        <div className="end__r up edge-t">
          <a className="mail" href={site.emailHref} data-hv>
            {site.email}
          </a>
          <span className="lb">{home.close.note}</span>
        </div>
      </section>
    </>
  );
}
