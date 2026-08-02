import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  Geist_Mono,
} from "next/font/google";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { WhatsAppDock } from "@/components/chrome/WhatsAppDock";
import { site } from "@/content/site";
import "./globals.css";

/*  ═══════════════════════════════════════════════════════════════════
    PART 1.3 — three faces, each in one role, self-hosted through
    next/font, display: swap, preloaded.

    The variable weight axis on Bricolage is required, not decorative:
    the home page animates font-variation-settings under the cursor and
    stage 5 animates headings from 400 to 800 as they enter. Loading a
    fixed instance would make both impossible.

    Instrument Serif has no weight axis. Anything that must vary on it
    varies its gradient position instead — PART 7.6.
    ═══════════════════════════════════════════════════════════════════ */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: true,
  variable: "--font-bricolage",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  variable: "--font-instrument",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: true,
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.mark} — ${site.short}`,
    template: `%s — ${site.mark}`,
  },
  description: `${site.position} ${site.short}`,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.mark,
    url: site.url,
    title: `${site.mark} — ${site.short}`,
    description: site.position,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.mark} — ${site.short}`,
    description: site.position,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#07070A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/*  PART 9 — Organization and LocalBusiness, with sameAs carrying the
    GitHub organisation. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}#organization`,
      name: site.name,
      alternateName: site.mark,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      description: site.position,
      foundingDate: site.founded,
      sameAs: [site.github],
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: site.region,
        addressCountry: "IN",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}#studio`,
      name: site.name,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      description: site.position,
      parentOrganization: { "@id": `${site.url}#organization` },
      sameAs: [site.github],
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: site.region,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.coords.lat,
        longitude: site.coords.lon,
      },
      areaServed: "Worldwide",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:30",
        closes: "19:00",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${geistMono.variable}`}
    >
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppDock />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
