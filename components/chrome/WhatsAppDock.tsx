"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onScroll } from "@/lib/scroll";
import { site } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    THE WHATSAPP CONTROL.

    Bottom left, opposite the bearing dial, so the two instruments read
    as a pair holding the corners of the panel rather than one widget
    stuck to a page. Void fill and a hairline border at rest, warming to
    --hot2 on approach — the same language as the chips and the send
    control, not a green bubble.

    It is absent on arrival and fades in once the visitor has actually
    started reading. Offering a phone number before someone has seen
    anything is a pop-up; offering it once they are into the page is an
    instrument.

    Hidden on /contact, where the number is already in the aside.
    ═══════════════════════════════════════════════════════════════════ */

export function WhatsAppDock() {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const hidden = pathname === "/contact";

  useEffect(() => {
    const el = ref.current;
    if (!el || hidden) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      /* no entrance to withhold — it is simply there */
      el.classList.add("on");
      return;
    }

    return onScroll(({ y }) => {
      el.classList.toggle("on", y > 120);
    });
  }, [hidden]);

  if (hidden) return null;

  return (
    <a
      ref={ref}
      className="wa"
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message Tycherra on WhatsApp, ${site.phone}`}
      data-hv
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          d="M16 4.6a11.4 11.4 0 0 0-9.7 17.4l.27.43-1.15 4.2 4.3-1.13.41.25A11.4 11.4 0 1 0 16 4.6Z"
        />
        <path
          fill="currentColor"
          d="M12.6 10.4c-.2-.45-.4-.46-.59-.46h-.5a.97.97 0 0 0-.7.33 2.95 2.95 0 0 0-.92 2.2c0 1.28.95 2.53 1.08 2.71.13.17 1.82 2.85 4.49 3.88 2.22.86 2.67.69 3.15.65.49-.05 1.57-.64 1.79-1.25.21-.62.21-1.15.15-1.26-.06-.11-.24-.18-.5-.31-.27-.13-1.58-.78-1.83-.87-.24-.09-.42-.13-.59.13-.17.26-.67.87-.83 1.04-.15.18-.3.2-.56.07a7.3 7.3 0 0 1-2.15-1.32 8.05 8.05 0 0 1-1.48-1.85c-.16-.26-.02-.4.11-.53.12-.12.27-.3.4-.46.14-.16.18-.27.27-.45.09-.17.04-.33-.02-.46-.07-.13-.58-1.42-.79-1.95Z"
        />
      </svg>
    </a>
  );
}
