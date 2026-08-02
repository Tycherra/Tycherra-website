import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

/*  ═══════════════════════════════════════════════════════════════════
    THE SOCIAL CARD.

    Every route renders one of these at 1200x630. It is not a logo on a
    colour — it carries the same three things the page carries: the void,
    the heat ramp climbing left to right, and the grotesque/serif pairing
    with the italic clause in the gradient.

    The faces are read off disk rather than fetched. next/font already
    pulls these from Google at build time, but an OG route that fetches
    is an OG route that can fail in a cold build and ship a blank card,
    and a blank card is worse than no card — so the two weights actually
    used here are committed under assets/og.
    ═══════════════════════════════════════════════════════════════════ */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

let cached: { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 | 800 }[] | null =
  null;

export async function ogFonts() {
  if (cached) return cached;
  const dir = join(process.cwd(), "assets", "og");
  const [grotesque, serif] = await Promise.all([
    readFile(join(dir, "bricolage-800.ttf")),
    readFile(join(dir, "instrument-italic.ttf")),
  ]);
  cached = [
    {
      name: "Grotesque",
      data: grotesque.buffer.slice(
        grotesque.byteOffset,
        grotesque.byteOffset + grotesque.byteLength,
      ) as ArrayBuffer,
      style: "normal",
      weight: 800,
    },
    {
      name: "Serif",
      data: serif.buffer.slice(
        serif.byteOffset,
        serif.byteOffset + serif.byteLength,
      ) as ArrayBuffer,
      style: "italic",
      weight: 400,
    },
  ];
  return cached;
}

/** `lead` is set in the grotesque, `clause` in the gradient italic. */
export function OgCard({
  label,
  lead,
  clause,
}: {
  label: string;
  lead: string;
  clause: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#07070a",
        padding: "64px 72px",
        position: "relative",
      }}
    >
      {/* the heat, arriving from the lower right exactly as it does on
          the page rather than sitting behind the type as a flat wash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          /*  Explicit, not `inset: 0`. Satori does not resolve opposing
              offsets into a size, so an inset-only box measures zero and
              paints nothing — which is why two passes of this card came
              out flat black. Same reason the gradient is linear: the
              radial it started as never rendered either. */
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          background:
            "linear-gradient(312deg, rgba(168,16,48,0.46) 0%, rgba(120,20,40,0.20) 26%, rgba(74,10,32,0.07) 46%, rgba(7,7,10,0) 64%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          display: "flex",
          background:
            "linear-gradient(90deg, #4a0a20 0%, #a81030 46%, #d8863a 78%, #f2eee6 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Grotesque",
            fontSize: 27,
            letterSpacing: "0.30em",
            color: "#f2eee6",
          }}
        >
          {site.name.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Grotesque",
            fontSize: 19,
            letterSpacing: "0.24em",
            color: "rgba(242,238,230,0.56)",
          }}
        >
          {label.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Grotesque",
            fontSize: 82,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            color: "#f2eee6",
            maxWidth: 1000,
          }}
        >
          {lead}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Serif",
            fontStyle: "italic",
            fontSize: 86,
            lineHeight: 1.08,
            marginTop: 6,
            maxWidth: 1000,
            backgroundImage:
              "linear-gradient(96deg, #a81030 4%, #c8452f 46%, #e0a04a 96%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {clause}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          position: "relative",
          gap: 40,
          fontFamily: "Grotesque",
          fontSize: 16,
          letterSpacing: "0.15em",
          color: "rgba(242,238,230,0.56)",
        }}
      >
        <div style={{ display: "flex" }}>{site.where.toUpperCase()}</div>
        <div style={{ display: "flex", color: "#d8863a" }}>
          {site.services.join(" · ").toUpperCase()}
        </div>
      </div>
    </div>
  );
}
