import Link from "next/link";
import { footer, nav, site } from "@/content/site";
import { Clock } from "./Clock";
import { GitHub, WhatsApp } from "@/components/ui/Glyph";

/*  ═══════════════════════════════════════════════════════════════════
    FOOTER — PART 3.2, rebuilt completely.
    Four columns on desktop, stacked on mobile. Every link takes the
    underline-draw. The availability indicator pulses on a 3s loop.
    The live IST clock sits opposite it.

    The fourth column is the studio's GitHub organisation — absent from
    the design and from the specification, added here. See NOTES.

    STAGE 3 puts the maze's footer circuit behind this block, its nodes
    lighting as it enters view.
    ═══════════════════════════════════════════════════════════════════ */

export function Footer() {
  const availability = site.availability.open
    ? site.availability.line
    : site.availability.lineWhenFull;

  return (
    <footer className="ft edge-t">
      <div className="ft__g">
        <div>
          <span className="mk__t">
            <b>{site.name}</b>
            <i className="mk__d" aria-hidden="true" />
          </span>
          <p className="ft__p">{site.position}</p>
        </div>

        <div className="ft__col">
          <h2 className="lb lb--on">{footer.columns.studio}</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="ul">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft__col">
          <h2 className="lb lb--on">{footer.columns.contact}</h2>
          <ul>
            <li>
              <a href={site.emailHref} className="ul">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.whatsapp}
                className="ul ft__ic"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsApp />
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className="ul">
                {site.phone}
              </a>
            </li>
          </ul>
        </div>

        <div className="ft__col">
          <h2 className="lb lb--on">{footer.columns.elsewhere}</h2>
          <ul>
            <li>
              <a
                href={site.github}
                className="ul ft__ic"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub />
                <span>{site.githubLabel}</span>
              </a>
            </li>
            <li>
              <span>{site.hoursShort}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="ft__status edge-t">
        <span className="ft__av">
          <span className="lb lb--on">{availability}</span>
          <i className="ft__dot" aria-hidden="true" />
        </span>
        <Clock className="lb" />
      </div>

      <div className="ft__base edge-t">
        <span className="lb">{footer.legal}</span>
        <span className="lb">{site.where}</span>
        <Link href="/privacy" className="lb ul">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
