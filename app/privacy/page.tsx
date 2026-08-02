import type { Metadata } from "next";
import { Bloom } from "@/components/ui/Bloom";
import { privacy } from "@/content/privacy";
import { site, stations } from "@/content/site";
import { heatPair } from "@/lib/ramp";

const station = stations["/privacy"];

export const metadata: Metadata = {
  title: "Privacy",
  description: privacy.lead,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div style={heatPair(station.from, 0.2)}>
      <header className="head">
        <Bloom p={0.86} x={{ right: "-16vw" }} y="-30%" w="60vw" max="820px" />
        <span className="lb lb--h">{privacy.label}</span>
        <h1 className="head__h">{privacy.h1}</h1>
        <p className="top__lead">{privacy.lead}</p>
        <p className="lb mt-[clamp(18px,3vh,30px)]">{privacy.updated}</p>
      </header>

      <section className="section">
        <div className="prose">
          {privacy.sections.map((s) => (
            <div key={s.title}>
              <h2>{s.title}</h2>
              {s.body.map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
          ))}

          <h2>{privacy.contact.title}</h2>
          <p>
            {privacy.contact.body}{" "}
            <a href={site.emailHref}>{site.email}</a>, or{" "}
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp {site.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
