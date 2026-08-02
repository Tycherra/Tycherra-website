import { escapeHtml, oneLine } from "./sanitize";
import type { EnquiryData } from "./validate";
import { site } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    THE TWO EMAILS — PART 6.2.
    Structure ported from the Prakyat build (api/_lib/email/*): table
    based, inline styled, 600px, no external CSS and no webfonts, a
    hidden preheader for the inbox preview, an IST timestamp in the
    footer, and every value escaped before it reaches the HTML.

    Only the palette and the voice change. Tycherra's surface is
    #07070A with bone type and a heat-gradient rule, so the mail is the
    dark instrument panel rather than Prakyat's warm parchment.

    To the studio  — plain and scannable, reply-to set to the enquirer
                     so replying goes straight back.
    To the enquirer — designed. This is the first thing a new client
                     sees after enquiring, and most studios send a
                     default. PART 6.2 says build it properly.
    ═══════════════════════════════════════════════════════════════════ */

const C = {
  void: "#07070A",
  raise: "#0E0E13",
  bone: "#F2EEE6",
  dim: "#8E8A84",
  edge: "#26232A",
  r1: "#A81030",
  r3: "#FF7A1A",
  r4: "#FFB627",
};

const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
const MONO = "SFMono-Regular, Menlo, Consolas, monospace";

export function istTimestamp(now: Date = new Date()): string {
  return `${now.toLocaleString("en-IN", {
    timeZone: site.timezone,
    dateStyle: "medium",
    timeStyle: "short",
  })} IST`;
}

/** the heat ramp as a 3px rule — the one piece of colour in the mail */
const RULE = `<div style="height:3px;background:linear-gradient(90deg,#4A0A20,${C.r1} 26%,#FF2D4E 52%,${C.r3} 78%,${C.r4});line-height:3px;font-size:3px;">&nbsp;</div>`;

function label(text: string): string {
  return `<p style="margin:0 0 6px;font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${C.dim};">${escapeHtml(text)}</p>`;
}

function detailsTable(rows: { label: string; value: string }[]): string {
  const body = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid ${C.edge};font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.dim};width:150px;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:11px 0;border-bottom:1px solid ${C.edge};font-family:${SANS};font-size:15px;color:${C.bone};vertical-align:top;">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${body}</table>`;
}

function textBlock(heading: string, text: string): string {
  const safe = escapeHtml(text).replace(/\r?\n/g, "<br />");
  return `${`<p style="margin:28px 0 8px;font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${C.dim};">${escapeHtml(heading)}</p>`}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:16px 20px;border-left:2px solid ${C.r3};background-color:${C.raise};font-family:${SANS};font-size:15px;line-height:1.62;color:${C.bone};">${safe}</td>
      </tr>
    </table>`;
}

function shell({
  preheader,
  title,
  content,
  footerNote,
}: {
  preheader: string;
  title: string;
  content: string;
  footerNote: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#000000;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:${C.void};border:1px solid ${C.edge};border-collapse:collapse;">
            <tr><td>${RULE}</td></tr>
            <tr>
              <td style="padding:34px 40px 4px;">
                <div style="font-family:${MONO};font-size:13px;letter-spacing:0.44em;text-transform:uppercase;color:${C.bone};">TYCHERRA&deg;</div>
                <div style="margin-top:9px;font-family:${MONO};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${C.dim};">A software studio in Bengaluru</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 40px 6px;">
                <h1 style="margin:0;font-family:${SANS};font-size:27px;font-weight:700;letter-spacing:-0.02em;color:${C.bone};">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr><td style="padding:10px 40px 34px;">${content}</td></tr>
            <tr><td style="padding:0 40px;"><div style="height:1px;background-color:${C.edge};line-height:1px;font-size:1px;">&nbsp;</div></td></tr>
            <tr>
              <td style="padding:20px 40px 32px;">
                <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.dim};">${escapeHtml(footerNote)}</p>
                <p style="margin:12px 0 0;font-family:${MONO};font-size:10px;letter-spacing:0.14em;color:${C.dim};">${escapeHtml(istTimestamp())}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** To the studio — plain, scannable, reply-to is the enquirer. */
export function studioEmail(d: EnquiryData): { subject: string; html: string } {
  const services = d.services.length ? d.services.join(" · ") : "Not specified";
  const subject = oneLine(`New enquiry — ${d.name}${d.company ? ` (${d.company})` : ""}`);

  const content =
    detailsTable([
      { label: "Name", value: d.name },
      { label: "Email", value: d.email },
      ...(d.company ? [{ label: "Company", value: d.company }] : []),
      { label: "Needs", value: services },
      { label: "Timing", value: d.when },
    ]) + textBlock("What they're building", d.what);

  return {
    subject,
    html: shell({
      preheader: `New enquiry from ${d.name}`,
      title: "New enquiry",
      content,
      footerNote: `Reply directly to this email to reach ${d.name}.`,
    }),
  };
}

/** To the enquirer — the confirmation, designed. */
export function confirmationEmail(d: EnquiryData): {
  subject: string;
  html: string;
} {
  const first = d.name.split(/\s+/)[0] || d.name;

  const content = `
    ${label("Received")}
    <p style="margin:0 0 18px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.bone};">
      ${escapeHtml(first)} — thank you. Your enquiry reached us and one of us will read it properly. Not an auto-reply after this one: a person.
    </p>
    <p style="margin:0 0 26px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.dim};">
      You'll hear back <strong style="color:${C.bone};font-weight:600;">within one working day</strong>. If it's quicker to talk, WhatsApp is open.
    </p>
    ${detailsTable([
      { label: "Reply", value: site.reply },
      { label: "Hours", value: site.hoursShort },
      { label: "Where", value: site.where },
    ])}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;border-collapse:collapse;">
      <tr>
        <td style="border:1px solid ${C.r3};">
          <a href="${site.whatsapp}" style="display:inline-block;padding:13px 24px;font-family:${MONO};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${C.r4};text-decoration:none;">Message us on WhatsApp</a>
        </td>
      </tr>
    </table>
    ${textBlock("What you sent", d.what)}`;

  return {
    subject: oneLine("We have your enquiry — Tycherra"),
    html: shell({
      preheader: "Received. You'll hear back within one working day.",
      title: "Received.",
      content,
      footerNote: `Reply to this email, or write to ${site.email}. Nothing you sent is stored on the site — this email is the only record.`,
    }),
  };
}
