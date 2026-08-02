/*  ═══════════════════════════════════════════════════════════════════
    SITE-WIDE CONTENT — PART 5.1
    Copy lives here, never in a component. This is what lets the words
    be revised without touching a single line of layout.

    Two rules apply throughout: lead with websites, and frame
    everything positively. The line is "based in Bengaluru, serving
    clients everywhere" — never "US", "USA" or "United States".
    ═══════════════════════════════════════════════════════════════════ */

export const site = {
  name: "Tycherra",
  mark: "Tycherra°",
  position: "A software studio in Bengaluru, building for clients everywhere.",
  short: "Websites, web applications, automation and integrations.",

  /* Set NEXT_PUBLIC_SITE_URL in Vercel. The fallback only affects
     canonicals and OG image resolution in local development. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tycherra.com",

  city: "Bengaluru",
  region: "Karnataka",
  country: "India",
  where: "Bengaluru, India",
  coords: { lat: 12.9716, lon: 77.5946, label: "12.97°N 77.59°E — Bengaluru" },

  hours: "09:30–19:00 IST",
  hoursShort: "09:30–19:00 IST",
  timezone: "Asia/Kolkata",
  reply: "Within one working day",
  replyShort: "≤ 1 working day",

  founded: "2026",

  email: "tycherra@gmail.com",
  phone: "+91 98456 91464",
  phoneHref: "tel:+919845691464",
  emailHref: "mailto:tycherra@gmail.com",
  whatsapp: "https://wa.me/919845691464",

  /* ADDED — the GitHub organisation. Missing from both the design and
     the specification; carried in the footer, the contact aside, the
     mobile sheet and the JSON-LD sameAs. See NOTES. */
  github: "https://github.com/Tycherra",
  githubLabel: "github.com/Tycherra",

  availability: {
    open: true,
    line: "Available for new projects",
    lineWhenFull: "Booked until further notice",
  },

  services: [
    "Websites",
    "Web applications",
    "Automation",
    "Integrations",
  ] as const,
} as const;

export type NavItem = {
  label: string;
  href: "/" | "/work" | "/about" | "/contact";
  index: string;
};

export const nav: readonly NavItem[] = [
  { label: "Home", href: "/", index: "01" },
  { label: "Work", href: "/work", index: "02" },
  { label: "About us", href: "/about", index: "03" },
  { label: "Contact us", href: "/contact", index: "04" },
] as const;

/*  ── ramp stations — PART 2.2 ──────────────────────────────────────
    Never reset on navigation. From stage 2 the driver animates from
    the previous route's exit value to the new route's entry value
    over ~600ms, so the visitor moves toward heat across the site.
    ─────────────────────────────────────────────────────────────── */
export const stations = {
  "/": { from: 0.0, to: 0.22 },
  "/work": { from: 0.22, to: 0.45 },
  "/about": { from: 0.62, to: 0.8 },
  "/contact": { from: 0.8, to: 1.0 },
  "/privacy": { from: 0.8, to: 1.0 },
  "/404": { from: 0.0, to: 0.0 },
} as const;

export type Route = keyof typeof stations;

export const footer = {
  columns: {
    studio: "Studio",
    contact: "Contact",
    elsewhere: "Elsewhere",
  },
  legal: `© ${site.founded} ${site.name}`,
} as const;
