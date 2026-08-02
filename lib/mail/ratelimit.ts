/*  ratelimit — best-effort in-memory sliding window.
    Ported from the Prakyat build (api/_lib/ratelimit.ts). Keyed on the
    client's first-hop IP: 5 requests / 10 min. Over → 429.

    Caveat, documented rather than hidden: this Map lives in one
    serverless instance's memory. It resets on cold start and is not
    shared across instances, so it is a spam speed-bump, not a hard
    quota. Stronger limiting needs a KV store, which the "no database"
    constraint forbids. Honeypot + validation + this window are the
    spam layer together.
    ═══════════════════════════════════════════════════════════════════ */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

const hits = new Map<string, number[]>();

/** First hop from x-forwarded-for; fall back to a shared bucket. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Record a hit and report whether the key is now over the limit. */
export function rateLimited(key: string, now: number = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(key, recent);

  /* opportunistic sweep so a warm instance cannot grow without bound */
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= cutoff)) hits.delete(k);
    }
  }

  return recent.length > MAX_HITS;
}

/** Test-only: clear the window between cases. */
export function _resetRateLimit(): void {
  hits.clear();
}
