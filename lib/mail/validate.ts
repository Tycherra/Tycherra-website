/*  validate — server-side validation.
    Ported from the Prakyat build (api/_lib/validate.ts). Hand
    validators rather than a schema library: the regexes are shared in
    intent with the client, the bundle stays lean, and the first
    failing message is the one the visitor sees.

    PART 6.1 of the specification names Zod. The instruction to
    replicate the Prakyat mechanism supersedes it, and this is the one
    place the two disagree.
    ═══════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Must match content/contact.ts `chips`. */
export const SERVICES = [
  "Website",
  "Web application",
  "Automation",
  "Integrations",
  "Not sure yet",
] as const;

export const LIMITS = {
  name: 120,
  email: 160,
  company: 160,
  what: 5000,
  when: 200,
} as const;

/* Graceful, on-voice error copy — these reach the panel, not a toast. */
const MSG = {
  name: "A name is required.",
  email: "Enter a valid email address.",
  what: "Tell us a little about what you're building.",
  when: "Let us know roughly when you'd like it live.",
  malformed: "Something in the form looked off. Please try again.",
} as const;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface EnquiryData {
  name: string;
  email: string;
  company: string;
  services: string[];
  what: string;
  when: string;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateEnquiry(body: unknown): ValidationResult<EnquiryData> {
  if (!isRecord(body)) return { ok: false, error: MSG.malformed };

  const name = asString(body.name);
  const email = asString(body.email);
  const company = asString(body.company);
  const what = asString(body.what);
  const when = asString(body.when);

  if (!name || name.length > LIMITS.name) return { ok: false, error: MSG.name };
  if (!email || !EMAIL_RE.test(email) || email.length > LIMITS.email)
    return { ok: false, error: MSG.email };
  if (company.length > LIMITS.company) return { ok: false, error: MSG.malformed };
  if (!what || what.length > LIMITS.what) return { ok: false, error: MSG.what };
  if (!when || when.length > LIMITS.when) return { ok: false, error: MSG.when };

  /* the chips are an allow-list; anything else is dropped silently
     rather than rejected, so a stale client cannot block a real send */
  const raw = Array.isArray(body.services) ? body.services : [];
  const services = raw
    .filter((s): s is string => typeof s === "string")
    .filter((s) => (SERVICES as readonly string[]).includes(s));

  return { ok: true, data: { name, email, company, services, what, when } };
}
