import { Resend } from "resend";

/*  resend — the mail client.
    Ported from the Prakyat build (api/_lib/resend.ts). One thin wrapper
    over the SDK; config comes entirely from env:

      RESEND_API_KEY  required in production
      CONTACT_TO      where enquiries land
      RESEND_FROM     the verified sender — one variable to swap once a
                      domain is verified, nothing else changes

    Dry-run: with no key OUTSIDE production we skip the network, log,
    and report a simulated success, so local and preview stay testable
    with no credentials. In production with no key we report `no-key`
    so the handler can fail cleanly rather than pretend.
    ═══════════════════════════════════════════════════════════════════ */

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export type SendResult =
  | { ok: true; simulated: boolean }
  | { ok: false; reason: "no-key" | "send-error" };

export const CONTACT_TO = process.env.CONTACT_TO || "tycherra@gmail.com";

/*  onboarding@resend.dev needs no DNS and only delivers to the address
    that owns the Resend account — correct for staging, and the single
    value to change once tycherra.com (or whichever domain) is verified. */
export const RESEND_FROM =
  process.env.RESEND_FROM || "Tycherra <onboarding@resend.dev>";

export async function sendMail(input: MailInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    if (process.env.VERCEL_ENV !== "production") {
      console.log(`[resend] dry-run — would send "${input.subject}" to ${input.to}`);
      return { ok: true, simulated: true };
    }
    console.error("[resend] RESEND_API_KEY missing in production");
    return { ok: false, reason: "no-key" };
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });
    if (error) {
      console.error("[resend] send error:", error);
      return { ok: false, reason: "send-error" };
    }
    return { ok: true, simulated: false };
  } catch (err) {
    console.error("[resend] threw:", err);
    return { ok: false, reason: "send-error" };
  }
}
