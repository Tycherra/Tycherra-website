/*  ═══════════════════════════════════════════════════════════════════
    /privacy
    The site is stateless by design — no CMS, no database, no auth, no
    analytics. That is a selling point, not an absence, and this page
    says so plainly rather than in the usual defensive register.
    ═══════════════════════════════════════════════════════════════════ */

export const privacy = {
  label: "Legal",
  h1: "Privacy",
  lead:
    "This site holds nothing about you. That isn't a policy we wrote " +
    "around a system — it is how the system was built.",
  updated: "Last reviewed 1 August 2026",

  sections: [
    {
      title: "What we collect",
      body: [
        "Nothing automatically. There is no analytics script, no advertising " +
          "pixel, no session recording, no fingerprinting, and no third-party " +
          "embed watching you read. We do not set cookies, so there is no " +
          "consent banner to dismiss.",
        "The only information that reaches us is what you type into the " +
          "contact form and send, or what you write to us directly by email " +
          "or WhatsApp.",
      ],
    },
    {
      title: "What happens to an enquiry",
      body: [
        "The contact form composes two emails — one to the studio and one " +
          "confirming receipt to you — and then forgets the message. There is " +
          "no database behind it and no copy retained on the server. The only " +
          "lasting record is the email itself, in our inbox, exactly as if you " +
          "had written to us directly.",
        "We use those details to reply to you and to discuss the work. We do " +
          "not add you to a mailing list, and we do not sell, share or trade " +
          "them with anyone.",
      ],
    },
    {
      title: "Who else is involved",
      body: [
        "Two suppliers touch the site. Vercel hosts it and keeps short-lived " +
          "operational request logs, as any host must. Resend delivers the two " +
          "enquiry emails. Neither is used to profile you, and no other " +
          "processor is involved.",
      ],
    },
    {
      title: "How long we keep it",
      body: [
        "Enquiry emails stay in our inbox while a conversation is live and " +
          "for as long as we may need the context afterwards. Ask us to delete " +
          "a thread and we will, and we will confirm when it is gone.",
      ],
    },
    {
      title: "Your rights",
      body: [
        "You can ask what we hold, ask for a copy, ask us to correct it, or " +
          "ask us to erase it. There is no form for this and no ticket queue — " +
          "write to us and a person will answer within one working day.",
      ],
    },
    {
      title: "Changes",
      body: [
        "If the site ever starts collecting something, this page changes " +
          "first and says exactly what and why. There is no version of this " +
          "site in which that happens quietly.",
      ],
    },
  ] as const,

  contact: {
    title: "Asking us anything",
    body: "Email is the fastest route, and it reaches a person, not a queue.",
  },
} as const;
