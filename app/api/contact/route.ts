import { clientIp, rateLimited } from "@/lib/mail/ratelimit";
import { sendMail, CONTACT_TO } from "@/lib/mail/resend";
import { confirmationEmail, studioEmail } from "@/lib/mail/templates";
import { validateEnquiry } from "@/lib/mail/validate";
import { site } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    POST /api/contact — PART 6.1.

    Stateless: rate-limit → read → honeypot → validate → send → { ok }.
    Nothing is persisted; the two emails are the only record. The guard
    order is spelled out explicitly rather than hidden in a middleware,
    which is how the Prakyat handler reads and why it is easy to audit.

    The honeypot moved from Prakyat's `company` to `website`: this form
    has a real, optional Company field, so `company` cannot be the trap.
    PART 6.1 names `website` anyway.

    The message body is never logged — PART 6.1.
    ═══════════════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEND_ERROR = `Could not send just now. Please try again, or email ${site.email} directly.`;

function json(status: number, payload: Record<string, unknown>) {
  return Response.json(payload, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req.headers))) {
    return json(429, {
      ok: false,
      error: "Too many requests. Please try again in a few minutes.",
    });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  /* honeypot: a real visitor never fills `website`. Answer 200 so a bot
     learns nothing from the difference. */
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).website === "string" &&
    ((body as Record<string, unknown>).website as string).trim().length > 0
  ) {
    return json(200, { ok: true });
  }

  const result = validateEnquiry(body);
  if (!result.ok) return json(400, { ok: false, error: result.error });

  const data = result.data;

  /* to the studio first — that one must land. reply-to is the enquirer
     so replying from the inbox goes straight back to them. */
  const studio = studioEmail(data);
  const sent = await sendMail({
    to: CONTACT_TO,
    subject: studio.subject,
    html: studio.html,
    replyTo: data.email,
  });

  if (!sent.ok) {
    if (sent.reason === "no-key") {
      return json(500, { ok: false, error: "Email service unavailable." });
    }
    return json(502, { ok: false, error: SEND_ERROR });
  }

  /* the confirmation is best-effort: the enquiry is already safe, and
     failing the request now would invite a duplicate submission */
  const confirm = confirmationEmail(data);
  const ack = await sendMail({
    to: data.email,
    subject: confirm.subject,
    html: confirm.html,
    replyTo: CONTACT_TO,
  });
  if (!ack.ok) console.error("[contact] confirmation failed:", ack.reason);

  return json(200, { ok: true, ...(sent.simulated ? { simulated: true } : {}) });
}

export async function GET() {
  return json(405, { ok: false, error: "Method not allowed." });
}
