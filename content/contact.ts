/*  ═══════════════════════════════════════════════════════════════════
    /contact — PART 5.5
    The quietest page. The form is the only instrument on it.
    ═══════════════════════════════════════════════════════════════════ */

export type Field = {
  name: "name" | "email" | "company" | "what" | "when";
  id: string;
  label: string;
  optional?: boolean;
  type: "text" | "email" | "textarea";
  autoComplete?: string;
  placeholder: string;
  required: boolean;
};

const fields: readonly Field[] = [
  {
    name: "name",
    id: "f-name",
    label: "Your name",
    type: "text",
    autoComplete: "name",
    placeholder: "Jane Mehta",
    required: true,
  },
  {
    name: "email",
    id: "f-email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "jane@company.com",
    required: true,
  },
  {
    name: "company",
    id: "f-company",
    label: "Company",
    optional: true,
    type: "text",
    autoComplete: "organization",
    placeholder: "Where you work",
    required: false,
  },
  {
    name: "what",
    id: "f-what",
    label: "What are you building?",
    type: "textarea",
    placeholder:
      "What it's for, who uses it, and what you'd like it to do. " +
      "A paragraph is plenty.",
    required: true,
  },
  {
    name: "when",
    id: "f-when",
    label: "When would you like it live?",
    type: "text",
    placeholder: "A date, a quarter, or “no fixed deadline”",
    required: true,
  },
];

export const contact = {
  label: "Start here",
  h1: "Contact us",
  lead:
    "Tell us what you're building. A few lines is enough to start — and if " +
    "we're not the right studio for it, we'll say so early and point you " +
    "somewhere better where we can.",

  panel: {
    label: "Enquiry",
    counterSuffix: "of 5 complete",
  },

  chipsLegend: "What do you need?",
  chips: [
    "Website",
    "Web application",
    "Automation",
    "Integrations",
    "Not sure yet",
  ] as const,

  fields,

  button: "Send it over",
  hint: {
    idle: "Fill the required rows to send",
    ready: "Ready to send",
    sending: "Sending",
  },

  sent: {
    title: "Received.",
    body:
      "One of us reads it properly — not an auto-reply. You'll hear back " +
      "within one working day.",
  },

  aside: {
    direct: {
      label: "Or reach us directly",
      body:
        "Some people would rather not fill in a form. That's fine — a plain " +
        "message reaches the same place.",
    },
    studio: {
      label: "Studio",
      rows: [
        { k: "Where", v: "Bengaluru, India" },
        { k: "Hours", v: "09:30–19:00 IST" },
        { k: "Local time", v: null }, // live
        { k: "Response", v: "≤ 1 working day" },
      ] as const,
    },
    working: {
      label: "Working with us",
      body:
        "We take a small number of projects at a time so the person " +
        "building yours isn't split across four others. If we're full, " +
        "we'll tell you when we're not.",
    },
  },

  next: {
    label: "What happens next",
    cards: [
      {
        n: "01",
        title: "We read it",
        body:
          "A person, not a filter. We decide whether we're the right studio " +
          "for it, and say so either way.",
      },
      {
        n: "02",
        title: "A short call",
        body:
          "Thirty minutes to understand what you're building and who it's " +
          "for. No slides, no pitch deck.",
      },
      {
        n: "03",
        title: "Scope and a date",
        body:
          "Written down, fixed, and a date we can hold. You decide from " +
          "there with everything in front of you.",
      },
    ] as const,
  },
} as const;

/*  ── /404 — PART 5.6 ─────────────────────────────────────────────── */
export const notFound = {
  label: "404 — no bearing",
  h1: "Off the map.",
  line: "That page doesn't exist — but everything else does.",
  link: "Back to the studio",
} as const;
