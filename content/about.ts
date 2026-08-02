/*  ═══════════════════════════════════════════════════════════════════
    /about — PART 5.4
    The six principles are kept verbatim from the prototype. They are
    the strongest copy on the site.
    ═══════════════════════════════════════════════════════════════════ */

export const about = {
  label: "Who we are",
  h1: "About",
  lead:
    "Tycherra is a software studio in Bengaluru. We build websites, web " +
    "applications, automation and integrations for clients everywhere.",
  /*  C6 — "Two people" and the working-hours range are gone from the
      strip. The live IST clock still carries the hours in the footer
      and the contact aside; a weekday range is not a credential. */
  meta: ["Founded 2026", "One studio"] as const,

  /*  C5 — what "small on purpose" used to gesture at, said directly and
      given its own section rather than buried in the lead. */
  different: {
    label: "What's different",
    body:
      "Crafted with care, built with conviction. We never compromise on " +
      "the experience or the quality.",
  },
  cue: "Scroll",
  hud: {
    left: { label: "Studio", value: "Bengaluru" },
    right: { label: "Serving", value: "Everywhere" },
  },

  statement: {
    label: "The difference",
    lead: "Anyone can build what you asked for. The harder thing is working out what you",
    serif: "should have asked for.",
  },

  method: {
    label: "The method",
    count: "Four stages",
    states: ["Scatter", "Cluster", "Lattice", "System"] as const,
    steps: [
      {
        n: "01",
        verb: "Listen",
        title: "Understand",
        body:
          "We start by asking what has to be true once this works. Not " +
          "features — outcomes. Most briefs describe a solution somebody " +
          "already picked, and the useful conversation is the one sitting " +
          "underneath it.",
      },
      {
        n: "02",
        verb: "Decide",
        title: "Shape",
        body:
          "Then we decide what to build, and just as carefully what not to. " +
          "Scope is the single biggest lever on whether software ships at " +
          "all. Everything we leave out is a decision we can defend a year " +
          "later.",
      },
      {
        n: "03",
        verb: "Make",
        title: "Build",
        body:
          "You see working software every week. Not a status report, not a " +
          "mockup — something you can open and use. If a direction is wrong " +
          "you find out in seven days instead of seven weeks.",
      },
      {
        n: "04",
        verb: "Release",
        title: "Hand over",
        body:
          "Code, repository, hosting and domain transfer to you on final " +
          "payment. No lock-in and no hostage accounts. If you want to take " +
          "it somewhere else in a year, you can — and we'll help you do it.",
      },
    ] as const,
  },

  principles: {
    label: "How we work",
    serif: "Six things we hold to.",
    items: [
      "We would rather lose the work than promise a date we cannot hold.",
      "Fast is a feature. Every project carries a performance budget from day one.",
      "No dashboards nobody opens. No CMS nobody updates.",
      "The person who writes the code sits in the meeting.",
      "Everything we build is yours the day you finish paying for it.",
      "If we wouldn't run it ourselves, we don't ship it.",
    ] as const,
  },

  refusals: {
    label: "What we don't do",
    cards: [
      {
        n: "01",
        title: "Impossible dates",
        body:
          "If a deadline is already unreachable when the brief arrives, we " +
          "say so rather than take the money and miss it. Saying no early is " +
          "cheaper for everyone than an apology in month three.",
      },
      {
        n: "02",
        title: "Price competition",
        body:
          "There are cheaper studios and there are faster ones. We are " +
          "neither. What we sell is the judgement about what to build — the " +
          "building is the easy half.",
      },
      {
        n: "03",
        title: "Work we can't stand behind",
        body:
          "We don't ship things we wouldn't run ourselves, and we don't pad " +
          "scope to raise an invoice. A smaller thing that works beats a " +
          "larger thing that nearly does.",
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
