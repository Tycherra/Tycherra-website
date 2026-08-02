/*  ═══════════════════════════════════════════════════════════════════
    / — PART 5.2
    Websites lead. Nothing is framed as broken.
    ═══════════════════════════════════════════════════════════════════ */

export const home = {
  hero: {
    label: "12.97°N 77.59°E — Bengaluru",
    h1: {
      line: "Nothing here is",
      serif: "left to chance.",
    },
    lead:
      "Websites, web applications, automation and integrations — designed " +
      "and built in Bengaluru for clients everywhere.",
    cue: "Scroll",
    hud: {
      left: { label: "Bearing", value: "000°" },
      right: { label: "Nodes", value: "0" },
    },
  },

  /* the plotted schematic cycles three figures — stage 3 draws them */
  schematic: ["Websites", "Software", "AI solutions"] as const,

  ticker: [
    "Websites",
    "Web applications",
    "Automation",
    "Integrations",
    "AI workflows",
  ] as const,

  statement: {
    label: "The difference",
    lead: "Most software is put together. Ours is",
    serif: "thought through.",
  },

  /* renamed from Bearing / Passage / Handover — plain English */
  columns: [
    {
      label: "Understand",
      body:
        "We start from what has to be true once this works, then work " +
        "backwards to the build.",
    },
    {
      label: "Build",
      body:
        "You see working software every week. Not a status report — " +
        "something you can open.",
    },
    {
      label: "Hand over",
      body:
        "Code, repository, hosting and domain become yours on final " +
        "payment. No lock-in.",
    },
  ] as const,

  work: {
    label: "Selected work",
    count: "Four entries",
    all: "All four entries",
  },

  capability: {
    label: "What we build",
    serif: "Four things, done properly.",
    rows: [
      {
        title: "Websites",
        body: "Sites that load fast and make the business look as serious as it is.",
      },
      {
        title: "Web applications",
        body: "Tools and platforms built around how your team actually works.",
      },
      {
        title: "Automation",
        body: "The repetitive work your staff does by hand, handled by a system instead.",
      },
      {
        title: "Integrations",
        body: "Making the tools you already pay for talk to each other properly.",
      },
    ] as const,
  },

  close: {
    label: "Start here",
    h2: "Let's build",
    serif: "something good.",
    note: "Response within one working day",
  },
} as const;
