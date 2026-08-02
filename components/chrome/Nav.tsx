"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/site";
import { Clock } from "./Clock";

/*  ═══════════════════════════════════════════════════════════════════
    NAVIGATION — PART 3.1
    One component, identical structure on all four routes. What changes
    per route is only the heat, which it inherits from --hot2.

    STAGE 1 carries the wordmark with its bearing dial and ramp rule,
    the four links with the needle parked under the current route, the
    live IST clock, and the Let's talk control.

    STAGE 2 adds: the sliding needle (hover, focus and route tracking),
    the scroll behaviour — transparent at the top, blurred past 80px,
    hidden on scroll-down past 400px — and the mobile sheet with its
    focus trap. Until then, under 860px the links wrap into a plain
    row so the site stays fully navigable on a phone.
    ═══════════════════════════════════════════════════════════════════ */

export function Nav() {
  const pathname = usePathname();
  const onContact = pathname === "/contact";

  return (
    <nav className="nav" aria-label="Primary">
      <Link href="/" className="mk" aria-label={`${site.mark} — home`}>
        <span className="mk__t">
          <b>{site.name}</b>
          <i className="mk__d" aria-hidden="true" />
        </span>
        <span className="mk__r" aria-hidden="true" />
      </Link>

      <div className="nav__set">
        {nav.map((item) => {
          const current = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nv"
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <Clock className="lb nav__clock" />

      {!onContact && (
        <Link href="/contact" className="talk">
          <span>Let&rsquo;s talk</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </nav>
  );
}
