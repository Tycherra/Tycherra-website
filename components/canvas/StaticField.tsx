import { FIELD_H, FIELD_W } from "@/lib/field";

/*  ═══════════════════════════════════════════════════════════════════
    THE BEARING FIELD — the plate, placed.
    Geometry and the reasoning behind it live in lib/field.ts; the
    files are written by scripts/generate-field.mts.

    A plain <img> rather than inline SVG: seventeen hundred segments
    inlined are serialised twice into every static page — once as
    markup, once into the RSC payload — which put 86KB of geometry into
    the home document. As an asset it is fetched once and cached.

    Decorative, so alt="" and aria-hidden. All the real content is in
    the DOM beside it — PART 7.7.
    ═══════════════════════════════════════════════════════════════════ */

export function StaticField({
  plate,
  className = "top__field",
}: {
  plate: "not-found";
  className?: string;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/field/${plate}.svg`}
      alt=""
      aria-hidden="true"
      width={FIELD_W}
      height={FIELD_H}
      className={className}
      decoding="async"
    />
  );
}
