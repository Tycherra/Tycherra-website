"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    THE LIVE IST CLOCK — nav, footer, contact aside, mobile sheet.
    Renders an em dash on the server and on the first client pass, so
    the tree matches and there is no hydration warning; the real time
    lands on mount. Tabular figures, so the digits never jitter.
    ═══════════════════════════════════════════════════════════════════ */

const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: site.timezone,
});

export function Clock({
  className,
  suffix = " IST",
}: {
  className?: string;
  suffix?: string;
}) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {now === null ? "—" : `${now}${suffix}`}
    </span>
  );
}
