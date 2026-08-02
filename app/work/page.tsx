import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cursor } from "@/components/chrome/Cursor";
import { Instruments } from "@/components/chrome/Instruments";
import { ScrollDriver } from "@/components/chrome/ScrollDriver";
import { Reveal } from "@/components/motion/Reveal";
import { Bloom } from "@/components/ui/Bloom";
import { WorkLive } from "@/components/work/WorkLive";
import { site, stations } from "@/content/site";
import { projects, workClose, workPage } from "@/content/work";

/*  ═══════════════════════════════════════════════════════════════════
    /work — THE PASSAGE. Heat 0.22 → 0.45, reads red.

    PART 4.2 — the moving bearing field is deliberately NOT ported from
    tycherra-work.html. Home carries the action; this page is considered
    and still. What replaces it is a static composition, one quiet
    detail only — a bloom behind the heading — and roughly thirty per
    cent more air. The whitespace is what makes it read premium now
    that the motion is gone.

    Everything else in the prototype is the floor and is here: the
    plate frames that draw themselves, the duotone treatment with hover
    restoring true colour, the alternating type-led composition, the
    left index rail with heat clearance, the plotted flow diagram for
    the entry with no screenshot, and the maze.

    Copy is PART 5.3 verbatim. The prototype's copy predates the final
    deck and is ignored.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/work"];

export const metadata: Metadata = {
  title: "Work",
  description: workPage.lead,
  alternates: { canonical: "/work" },
  openGraph: {
    title: `Work — ${site.mark}`,
    description: workPage.lead,
    url: `${site.url}/work`,
  },
};

export default function WorkPage() {
  return (
    <>
      <ScrollDriver />
      <Instruments from={station.from} to={station.to} lead={0.2} seed={1487} />
      {/* PART 3.3 — the reticle is Home's hero only. The charged trail
          stays site-wide, which is what this mounts here. */}
      <Cursor heroSelector=".hero" />
      <Reveal />
      <WorkLive />

      <header className="top top--air" id="top">
        <Bloom p={0.3} x={{ right: "-6vw" }} y="26%" w="42vw" max="580px" />
        <div className="top__v" />

        <div className="hud hud--l">
          <span>{workPage.hud.left.label}</span>
          <b>{workPage.hud.left.value}</b>
        </div>
        <div className="hud hud--r">
          <span>{workPage.hud.right.label}</span>
          <b>{workPage.hud.right.value}</b>
        </div>

        <div className="top__in">
          <span className="lb lb--h" data-decode>
            {workPage.label}
          </span>
          {/* the one character-rise heading on this page — PART 2.5 C */}
          <h1 className="top__h" data-chars>
            {workPage.h1}
          </h1>
          <p className="top__lead up">{workPage.lead}</p>
          <div className="top__m up edge-t">
            {workPage.manifest.map((m) => (
              <span key={m} className="lb">
                {m}
              </span>
            ))}
            <span className="lb">
              {workPage.rule.lead}
              <b>{workPage.rule.strong}</b>
            </span>
            <span className="cue">
              <i aria-hidden="true" />
              <span className="lb">{workPage.cue}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="rail">
        <nav className="idx" aria-label="Project index">
          <span className="idx__in">
            {projects.map((p) => (
              <a key={p.id} href={`#${p.id}`}>
                <i aria-hidden="true" />
                {p.short}
              </a>
            ))}
          </span>
        </nav>

        {projects.map((p, i) => (
          <article
            key={p.id}
            id={p.id}
            data-reveal
            data-hv
            className={`wp wp--${i + 1}${i % 2 === 1 ? " wp--flip" : ""}${
              i > 0 ? " edge-t" : ""
            }`}
          >
            <div className="wp__grid">
              <div className="wp__body">
                <div className="wp__lead">
                  <span className="lb wp__n">{p.n}</span>
                  <i aria-hidden="true" />
                  <span className="lb">{p.year}</span>
                  <i aria-hidden="true" />
                  <span className="lb">{p.kind}</span>
                  <i aria-hidden="true" />
                  <span className="lb">{p.note}</span>
                </div>

                <h2 className="wp__t">
                  <span className="mask">
                    <span>{p.name}</span>
                  </span>
                </h2>

                <div className="wp__cols">
                  <div className="wp__c skw">
                    <span className="lb" data-decode>
                      The situation
                    </span>
                    <p>{p.situation}</p>
                  </div>
                  <div className="wp__c wp__c--a skw">
                    <span className="lb" data-decode>
                      What we built
                    </span>
                    <p>{p.built}</p>
                  </div>
                </div>

                <div className="wp__foot edge-t">
                  <div className="wp__k">
                    {p.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  {/* only where there is somewhere to go — see work.ts */}
                  {p.visit && (
                    <a
                      className="wp__go"
                      href={p.visit}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit the site →
                    </a>
                  )}
                </div>
              </div>

              <div className="wp__side">
                <div className="pl">
                  <div className="pl__st">
                    {p.plate ? (
                      <Image
                        src={p.plate.src}
                        alt={p.plate.alt}
                        width={p.plate.width}
                        height={p.plate.height}
                        sizes="(max-width: 999px) 92vw, 40vw"
                        priority={i === 0}
                        loading={i === 0 ? undefined : "lazy"}
                        quality={82}
                      />
                    ) : (
                      /* plotted by lib/plot-engine through WorkLive */
                      <canvas className="plot" aria-hidden="true" />
                    )}
                    {p.plate && <div className="pl__tone" aria-hidden="true" />}
                    <div className="pl__lift" aria-hidden="true" />
                    <div className="pl__grid" aria-hidden="true" />
                    <svg
                      className="pl__f"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </div>
                  <div className="pl__d">
                    <span>{p.caption[0]}</span>
                    <hr />
                    <span>{p.caption[1]}</span>
                    <hr />
                    <em>{p.caption[2]}</em>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="end edge-t">
        <Bloom
          p={0.42}
          x={{ right: "-19vw" }}
          y="-16%"
          w="84vw"
          max="1120px"
          ratio={84 / 72}
        />
        <span className="lb up" data-decode>
          {workClose.label}
        </span>
        <h2 className="end__h">
          <span className="mask">
            <span>{workClose.h1}</span>
          </span>
          <span className="mask">
            <span>
              <em>{workClose.h2}</em>
            </span>
          </span>
        </h2>
        <div className="end__r up edge-t">
          <Link className="mail" href="/contact" data-hv>
            {site.email}
          </Link>
          <span className="lb">{workClose.note}</span>
          <a
            className="lb ul ml-auto"
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            Code — {site.githubLabel}
          </a>
        </div>
      </section>
    </>
  );
}
