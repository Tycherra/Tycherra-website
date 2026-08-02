/*  ═══════════════════════════════════════════════════════════════════
    /work — PART 5.3
    Per entry the problem line / outcome line structure holds, rewritten
    so the outcome leads with what the client gained.
    ═══════════════════════════════════════════════════════════════════ */

export type Plate = {
  /* 2× the maximum rendered width (640px) and no more — PART 7.5 */
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Project = {
  id: string;
  n: string;
  name: string;
  short: string;
  year: string;
  kind: string;
  note: string;
  situation: string;
  built: string;
  stack: readonly string[];
  plate: Plate | null;
  caption: readonly [string, string, string];
  /*  Only Prakyat is publicly reachable. The prototype put a "Read the
      passage" link on every entry pointing at itself; three dead links
      are worse than none, so the affordance exists only where there is
      somewhere to go. */
  visit?: string;
  /* the one-liner the home index carries */
  line: string;
};

export const workPage = {
  label: "Selected work",
  h1: "Work",
  lead:
    "Four things built between 2025 and 2026. Two for clients, two because " +
    "the problem wouldn't leave us alone. Every one still runs.",
  manifest: [
    "Four entries",
    "Two years",
    "Nine stacks",
  ] as const,
  rule: {
    lead: "",
    strong: "Nothing ships unless we'd use it ourselves",
  },
  hud: {
    left: { label: "Entries", value: "04" },
    right: { label: "Span", value: "2025—2026" },
  },
  cue: "Scroll",
} as const;

export const projects: readonly Project[] = [
  {
    id: "p1",
    n: "01",
    name: "Prakyat",
    short: "Prakyat",
    year: "2026",
    kind: "Client work",
    note: "bettercallprakyat.com",
    situation:
      "A practising advocate across six jurisdictions, and no way for a " +
      "first-time client to judge him before walking into a consultation. " +
      "The profession forbids advertising, so the usual moves were off the table.",
    built:
      "A practice site that opens with one unbroken descent — orbit, to " +
      "Bengaluru, to the High Court, to his chamber — then gets out of the " +
      "way. Long-form articles, plain language, and a consult form that " +
      "reaches him directly. Nothing is stored, so nothing can leak.",
    stack: [
      "React 19",
      "TypeScript",
      "Vite 6",
      "Tailwind v4",
      "GSAP",
      "Resend",
      "Vercel",
    ],
    plate: {
      src: "/work/prakyat.webp",
      width: 1280,
      height: 728,
      alt:
        "The Prakyat practice site: a cream editorial layout with the serif " +
        "headline “The law, read closely. Counsel, given plainly.” beside " +
        "photographs of scales and a gavel.",
    },
    caption: ["Plate 01", "Practice site", "Live"],
    visit: "https://www.bettercallprakyat.com",
    line: "A practice site for an advocate, built to read as considered rather than corporate.",
  },
  {
    id: "p2",
    n: "02",
    name: "Attack Path",
    short: "Attack Path",
    year: "2026",
    kind: "Internal tool",
    note: "DevSecOps",
    situation:
      "A scanner returns a list of vulnerabilities ranked by severity. It " +
      "won't tell you which two medium findings become a breach when an " +
      "attacker chains them.",
    built:
      "Live CVE data from the NVD, modelled as a graph of hosts, services " +
      "and vulnerabilities. Choose an entry point and an asset, and it " +
      "traces every route between them — scored by how practical each hop " +
      "actually is.",
    stack: ["React", "React Flow", "Express", "SQLite", "NVD API"],
    plate: {
      src: "/work/attack-path.webp",
      width: 1280,
      height: 940,
      alt:
        "The Attack Path Explorer interface: a dark threat-analysis " +
        "workspace showing a node graph of CVEs chained from an internet " +
        "entry point through web and app servers to sensitive records.",
    },
    caption: ["Plate 02", "Graph analysis", "Internal"],
    line: "Live CVE data modelled as a graph, tracing every practical route to a sensitive asset.",
  },
  {
    id: "p3",
    n: "03",
    name: "Curiosity Engine",
    short: "Curiosity",
    year: "2026",
    kind: "Personal project",
    note: "Open source",
    situation:
      "Every public data source tells you something. None of them tell you " +
      "where the world's attention is concentrated right now, or what is " +
      "rising underneath it.",
    built:
      "A containerised Go service pulling several sources on a schedule, " +
      "scoring them into one index, served behind a globe that blooms where " +
      "the pressure is.",
    stack: ["Go", "Docker", "Postgres", "Three.js"],
    plate: {
      src: "/work/curiosity-engine.webp",
      width: 1280,
      height: 727,
      alt:
        "The Curiosity Engine interface: a dark globe visualisation with " +
        "regions blooming where the attention index is highest, beside a " +
        "ranked readout of rising signals.",
    },
    caption: ["Plate 03", "Data pipeline", "Running"],
    line: "A scheduled Go service scoring public sources into one index of where attention is going.",
  },
  {
    id: "p4",
    n: "04",
    name: "Test Ride",
    short: "Test Ride",
    year: "2025",
    kind: "Client work",
    note: "No public interface",
    situation:
      "A dealership hands a motorcycle to someone they met ten minutes ago. " +
      "Rider details go onto paper, and the team finds out how it went when " +
      "the bike comes back.",
    built:
      "An internal flow that verifies the rider by OTP before the keys move, " +
      "records the handover, and returns a complete report to the team on " +
      "return. It exists so staff always know who has what.",
    stack: ["Go", "OTP verification", "Reporting"],
    plate: null,
    caption: ["Plate 04", "Flow diagram", "Internal"],
    line: "An internal handover flow: verify the rider by OTP before the keys move, report on return.",
  },
] as const;

export const workClose = {
  label: "Next",
  h1: "Let's build",
  h2: "something good.",
  note: "Response within one working day",
} as const;
