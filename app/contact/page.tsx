import type { Metadata } from "next";
import { Clock } from "@/components/chrome/Clock";
import { Bloom } from "@/components/ui/Bloom";
import { GitHub, WhatsApp } from "@/components/ui/Glyph";
import { contact } from "@/content/contact";
import { site, stations } from "@/content/site";
import { heatPair } from "@/lib/ramp";

/*  ═══════════════════════════════════════════════════════════════════
    /contact — THE HANDOVER. Heat 0.80 → 1.00, reads gold.

    The quietest page: no hero, no field. The form is the page, and the
    only instrument on it.

    STAGE 1 builds the panel exactly as it will ship — including the
    fieldset that carried the white box in the prototype, now swept by
    styles/reset.css — and holds the send control in its correct
    initial state: unlit and disabled, because nothing has been filled
    in and there is no client validation yet. Until stage 4 wires the
    Resend route, the aside beside it is the working path: email,
    WhatsApp, phone and GitHub all resolve.

    STAGE 4 adds the status lights, the n-of-5 counter, the Zod schema
    shared with the route handler, the honeypot, the rate limit, both
    designed emails, and the lock-in on submit.
    ═══════════════════════════════════════════════════════════════════ */

const station = stations["/contact"];

export const metadata: Metadata = {
  title: "Contact us",
  description: contact.lead,
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact us — ${site.mark}`, description: contact.lead },
};

export default function ContactPage() {
  return (
    <div style={heatPair(station.from, 0.2)}>
      <header className="head" id="top">
        <Bloom p={0.86} x={{ right: "-8vw" }} y="-40%" w="44vw" max="600px" />
        <span className="lb lb--h">{contact.label}</span>
        <h1 className="head__h">{contact.h1}</h1>
        <p className="top__lead">{contact.lead}</p>
      </header>

      <section className="panel">
        <Bloom p={0.94} x={{ left: "-10vw" }} y="24%" w="40vw" max="540px" />
        <div className="panel__in edge-t">
          <div className="panel__bar">
            <h2 className="lb">{contact.panel.label}</h2>
            <span className="lb">
              <b>0</b> {contact.panel.counterSuffix}
            </span>
          </div>

          <div className="grid">
            <form className="form">
              <fieldset className="f__set">
                <legend className="lb f__legend">{contact.chipsLegend}</legend>
                <div className="chips">
                  {contact.chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="chip"
                      aria-pressed="false"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="pair">
                {contact.fields.slice(0, 2).map((f) => (
                  <Row key={f.id} field={f} />
                ))}
              </div>

              {contact.fields.slice(2).map((f) => (
                <Row key={f.id} field={f} />
              ))}

              <div className="send">
                <button className="btn" type="submit" disabled>
                  <i aria-hidden="true" />
                  {contact.button}
                </button>
                <span className="lb">{contact.hint.idle}</span>
              </div>
            </form>

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
        <h2 className="lb">{contact.next.label}</h2>
        <div className="cards">
          {contact.next.cards.map((c) => (
            <div key={c.n} className="card edge-t">
              <span className="lb">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ field }: { field: (typeof contact.fields)[number] }) {
  return (
    <div className="row">
      <label className="lb" htmlFor={field.id}>
        {field.label}
        {field.optional && <span className="opacity-50"> — optional</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={field.id}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
        />
      ) : (
        <input
          id={field.id}
          name={field.name}
          type={field.type}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}
    </div>
  );
}
