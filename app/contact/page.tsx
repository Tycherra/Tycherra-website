import type { Metadata } from "next";
import { Clock } from "@/components/chrome/Clock";
import { Cursor } from "@/components/chrome/Cursor";
import { Instruments } from "@/components/chrome/Instruments";
import { ScrollDriver } from "@/components/chrome/ScrollDriver";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { Reveal } from "@/components/motion/Reveal";
import { Bloom } from "@/components/ui/Bloom";
import { GitHub, WhatsApp } from "@/components/ui/Glyph";
import { contact } from "@/content/contact";
import { site, stations } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    /contact — THE HANDOVER. Heat 0.80 → 1.00, reads gold.

    The hottest point on the site: home opens cold in oxblood, work runs
    red, about runs orange, and this closes in amber. The visitor has
    been moving toward heat the whole way and arrives here.

    Deliberately the quietest page. No hero, no field, no plates. The
    only instrument is the form, and the heading is exactly "Contact us"
    — the prototype's "Tell us what's broken." predates the final deck.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/contact"];

export const metadata: Metadata = {
  title: "Contact us",
  description: contact.lead,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact us — ${site.mark}`,
    description: contact.lead,
    url: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <ScrollDriver />
      <Instruments from={station.from} to={station.to} lead={0.2} seed={2909} />
      <Cursor heroSelector=".hero" />
      <Reveal />

      <header className="head" id="top">
        <Bloom p={0.86} x={{ right: "-8vw" }} y="-40%" w="44vw" max="600px" />
        <span className="lb lb--h" data-decode>
          {contact.label}
        </span>
        {/*  F4 — the same measure, weight, technique and spacing as
             Work and About. It was on its own smaller scale with no
             reveal at all, which made it read as a different set. */}
        <h1 className="top__h" data-chars>
          {contact.h1}
        </h1>
        <p className="top__lead up">{contact.lead}</p>
      </header>

      <section className="panel">
        <Bloom p={0.94} x={{ left: "-10vw" }} y="24%" w="40vw" max="540px" />
        <div className="panel__in edge-t">
          <div className="panel__bar">
            <h2 className="lb" data-decode>
              {contact.panel.label}
            </h2>
            <span className="lb">{site.hoursShort}</span>
          </div>

          <div className="grid">
            <ContactPanel />

            <aside className="side">
              <div className="side__b edge-t">
                <span className="lb">{contact.aside.direct.label}</span>
                <div className="side__row">
                  <a className="mail mail--sm" href={site.emailHref}>
                    {site.email}
                  </a>
                </div>
                <div className="side__row">
                  <a
                    className="lb ul ft__ic"
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsApp />
                    <span>WhatsApp {site.phone}</span>
                  </a>
                </div>
                <div className="side__row">
                  <a className="lb ul" href={site.phoneHref}>
                    Call {site.phone}
                  </a>
                </div>
                <div className="side__row">
                  <a
                    className="lb ul ft__ic"
                    href={site.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitHub />
                    <span>{site.githubLabel}</span>
                  </a>
                </div>
                <p>{contact.aside.direct.body}</p>
              </div>

              <div className="side__b edge-t">
                <span className="lb">{contact.aside.studio.label}</span>
                <div className="mt-[10px]">
                  {contact.aside.studio.rows.map((r) => (
                    <div key={r.k} className="side__k">
                      <span className="lb">{r.k}</span>
                      <b>{r.v === null ? <Clock /> : r.v}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="side__b edge-t">
                <span className="lb">{contact.aside.working.label}</span>
                <p>{contact.aside.working.body}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section edge-t">
        <Bloom p={0.98} x={{ right: "-10vw" }} y="-8%" w="44vw" max="620px" />
        <h2 className="lb up" data-decode>
          {contact.next.label}
        </h2>
        <div className="cards">
          {contact.next.cards.map((c) => (
            <div key={c.n} className="card skw edge-t">
              <span className="lb">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
