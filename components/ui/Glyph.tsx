/*  ═══════════════════════════════════════════════════════════════════
    GLYPHS — inline SVG only. No icon library, no emoji. PART 6.3.
    Each is drawn on a 16-unit grid and inherits currentColor so it
    takes whatever heat the surrounding type is carrying.
    ═══════════════════════════════════════════════════════════════════ */

type Props = { className?: string };

export function WhatsApp({ className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8.02 1.6a6.36 6.36 0 0 0-5.4 9.72l.15.24-.64 2.34 2.4-.63.23.14a6.36 6.36 0 1 0 3.26-11.8Zm0 1.17a5.19 5.19 0 1 1-2.64 9.65l-.19-.11-1.42.37.38-1.39-.12-.2A5.19 5.19 0 0 1 8.02 2.8Z"
      />
      <path
        fill="currentColor"
        d="M6.28 4.79c-.14-.31-.28-.32-.41-.32h-.35a.68.68 0 0 0-.49.23 2.06 2.06 0 0 0-.64 1.53c0 .9.66 1.78.75 1.9.09.12 1.27 1.99 3.13 2.71 1.55.6 1.87.48 2.2.45.34-.03 1.09-.44 1.24-.87.15-.43.15-.8.11-.88-.05-.07-.17-.12-.35-.21-.19-.1-1.1-.54-1.27-.6-.17-.06-.29-.09-.41.09-.12.18-.47.6-.58.72-.1.12-.21.14-.4.05a5.1 5.1 0 0 1-1.5-.92 5.62 5.62 0 0 1-1.03-1.29c-.11-.18-.01-.28.08-.37.08-.08.19-.21.28-.32.09-.11.12-.19.18-.31.06-.12.03-.23-.02-.32-.04-.09-.4-.99-.55-1.36Z"
      />
    </svg>
  );
}

export function GitHub({ className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8 .6a7.4 7.4 0 0 0-2.34 14.42c.37.07.5-.16.5-.36l-.01-1.26c-2.06.45-2.5-.99-2.5-.99-.33-.86-.82-1.09-.82-1.09-.68-.46.05-.45.05-.45.74.05 1.13.77 1.13.77.66 1.13 1.74.8 2.17.62.07-.49.26-.81.47-1-1.65-.19-3.38-.83-3.38-3.68 0-.81.29-1.48.76-2-.07-.19-.33-.94.08-1.96 0 0 .62-.2 2.03.76a7 7 0 0 1 3.7 0c1.41-.96 2.03-.76 2.03-.76.41 1.02.15 1.77.08 1.96.47.52.76 1.19.76 2 0 2.86-1.74 3.49-3.4 3.67.27.23.5.68.5 1.38l-.01 2.05c0 .2.14.44.51.36A7.4 7.4 0 0 0 8 .6Z"
      />
    </svg>
  );
}

export function Mail({ className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        d="M1.6 3.6h12.8v8.8H1.6zM1.6 4.2 8 8.8l6.4-4.6"
      />
    </svg>
  );
}

export function Arrow({ className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        d="M2.5 8h11M9.5 4l4 4-4 4"
      />
    </svg>
  );
}
