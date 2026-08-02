/*  sanitize — the injection barrier.
    Ported from the Prakyat build (api/_lib/sanitize.ts). EVERY
    user-supplied value is escaped before it enters an HTML email
    template, so an inbox can never be turned into a phishing surface,
    and every value that reaches a subject line is flattened so it
    cannot carry a header injection.
    ═══════════════════════════════════════════════════════════════════ */

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape the five HTML-significant characters. Non-strings coerce safely. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/** Collapse whitespace runs — including CR/LF — for use in a subject. */
export function oneLine(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hard length cap. Belt and braces alongside validate.ts. */
export function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
