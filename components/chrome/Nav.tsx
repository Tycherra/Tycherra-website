"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/site";
import { Clock } from "./Clock";
import { WhatsApp } from "@/components/ui/Glyph";

/*  ═══════════════════════════════════════════════════════════════════
    NAVIGATION — PART 3.1
    One component, identical structure on all four routes. What changes
    per route is only the heat, which it inherits from --hot2.

    Desktop carries the wordmark with its bearing dial and ramp rule,
    the four links with the needle parked under the current route, and
    the live IST clock.

    Under 860px it becomes the sheet: a two-line mark that rotates to an
    X, a surface that wipes up on clip-path, four items at display size
    with their index numbers staggered in, and a footer carrying the
    direct routes and the clock. Escape closes it, body scroll locks
    while it is open, focus is trapped inside it, and aria-expanded and
    aria-hidden are maintained throughout.
    ═══════════════════════════════════════════════════════════════════ */

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  /*  The sheet never survives a route change. Derived during render
      rather than in an effect: setState inside an effect would schedule
      a second render pass on every navigation, and React rightly warns
      about it. Each link also closes on click; this covers back and
      forward. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle("menu", open);
    if (!open) return;

    const sheet = sheetRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        burgerRef.current?.focus();
        return;
      }
      /* trap: the sheet covers the page, so tabbing out of it would
         land on chrome the visitor cannot see */
      if (e.key !== "Tab" || !sheet) return;
      const focusable = sheet.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    /* move focus in so the first Tab lands inside, not behind */
    sheet?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu");
    };
  }, [open, close]);

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <Link href="/" className="mk" aria-label={`${site.mark} — home`}>
          <span className="mk__t">
            <b>{site.name}</b>
            <i className="mk__d" aria-hidden="true" />
          </span>
          <span className="mk__r" aria-hidden="true" />
        </Link>

        <div className="nav__set">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nv"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Clock className="lb nav__clock" />

        <button
          ref={burgerRef}
          className="burger"
          type="button"
          aria-label={open ? "Close menu" : "Menu"}
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
      </nav>

      <div
        className="sheet"
        id="nav-sheet"
        ref={sheetRef}
        aria-hidden={!open}
        {...(!open ? { inert: "" as unknown as boolean } : {})}
      >
        <div className="sheet__in">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="sheet__l"
              onClick={close}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="lb">{item.index}</span>
              <em>{item.label}</em>
            </Link>
          ))}

          <div className="sheet__ft">
            <a className="lb ul" href={site.emailHref}>
              {site.email}
            </a>
            <a
              className="lb ul ft__ic"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp />
              <span>WhatsApp</span>
            </a>
            <Clock className="lb" />
          </div>
        </div>
      </div>
    </>
  );
}
