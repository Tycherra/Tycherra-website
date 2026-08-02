# Tycherra°

A software studio in Bengaluru, building for clients everywhere.

Next.js App Router · TypeScript · Tailwind v4 with design tokens as CSS
variables · no component library · stateless — no CMS, no database, no auth.

Built to `TYCHERRA-PRODUCTION.md`, which is the authoritative specification.
The four HTML prototypes are the floor, not the ceiling.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # runs `npm run field` first, then next build
npm run field        # regenerate the static bearing plates
```

`NEXT_PUBLIC_SITE_URL` sets the canonical origin. Without it, canonicals and
OG image URLs resolve against `https://tycherra.com` — set it in Vercel before
the first public deploy.

---

## Layout

```
app/            routes; one file per route, metadata co-located
components/
  chrome/       Nav, Footer, Clock — one component each, never copied
  canvas/       StaticField, MethodPlate, PlateFrame
  ui/           Bloom, Glyph
content/        all copy, as typed objects. No string lives in a component.
lib/
  ramp.ts       the heat ramp — the single source of truth for colour
  field.ts      the bearing plate generator
scripts/
  generate-field.mts   writes public/field/*.svg at prebuild
styles/
  tokens.css    design tokens, unlayered so @theme reaches Tailwind
  reset.css     the native element sweep            → layer(base)
  system.css    the design system                   → layer(components)
```

**Cascade layers matter here.** Tailwind v4 declares
`@layer theme, base, components, utilities`, and *unlayered CSS beats every
layer*. Importing the reset unlayered let `* { margin: 0 }` silently win over
every margin utility on the site. `app/globals.css` puts the reset in `base`
and the system in `components`, below utilities where they belong.

---

## Build stages

Part 10 of the specification. Deploy after each.

| | | |
|---|---|---|
| **1** | Shell, routes, tokens, reset, type, content, Nav/Footer, static plates | **done** |
| 2 | Motion system, Lenis, scroll-driven heat, spine/dial/frame/grain/wash, nav scroll + mobile sheet | |
| 3 | Canvas: bearing field, schematic plate, loader, maze, Method, plate frames, lock-in | |
| 4 | Contact: Resend route, Zod, honeypot, rate limit, both designed emails, status lights | |
| 5 | Page transitions, magnetic controls, variable font animation, copy-on-click, OG images | |
| 6 | Audit: Lighthouse 95+ mobile, keyboard, reduced motion, contrast, every breakpoint | |

### What stage 1 ships

Four routes plus 404 and privacy, all statically prerendered. Full token set
and native-element reset. The three faces in their assigned roles. Every word
from Part 5, in `/content`. Shared Nav and Footer. Static bearing plates on
Home and 404, the resolved Method plate on About, the real screenshots with
the duotone treatment on Work. Per-route metadata, JSON-LD, sitemap, robots.
Skip link, focus rings from the ramp, one `h1` per page with no skipped level.

### What stage 1 deliberately does not ship

No motion beyond CSS hover, the wordmark's dial sweep, the hero cue and the
footer's availability pulse — all gated by `prefers-reduced-motion`. No canvas.
No spine, dial, frame marks, grain, wash or maze. No decode, no reticle, no
trail. The mobile sheet is a plain wrapped link row until stage 2 replaces it.
**The contact form's send control is disabled**: that is its correct initial
state, and there is no client validation or route handler until stage 4. The
aside beside it is the working path — email, WhatsApp, phone and GitHub all
resolve.

---

## Decisions taken against the specification

Each of these is a place the spec and the prototypes disagree, or where
following the letter would have broken something. Flagged rather than silently
resolved.

**Home's `h1` does not take the shared measure.** Part 2.4 and 7.2 require
`clamp(56px, 15.5vw, 250px)` on Home, Work and About. Work and About have it.
Home's `h1` is a two-line composition — *Nothing here is / left to chance.* —
and fifteen characters at 15.5vw overruns the viewport at every width above
320px. It keeps the prototype's paired measure, `--h1-pair` and
`--h1-pair-serif`. The rule is honoured everywhere it is possible to honour.

**`--dim` is raised from `.40` to `.56`.** Part 7.7 asks for the dim text
floor to be verified against WCAG AA and raised if it fails. `.52` measures
5.05:1 on `#07070A` and passes. `.40`, which every 9px mono label used,
measures 3.38:1 and fails. `.56` measures 5.72:1. Interactive control borders
took a matching lift to `--edge` (`.40`, 3.38:1) to clear 1.4.11; purely
decorative hairlines stay at `--dimmer`.

**Plate luminance dropped from `.86` to `.66`.** Part 2.3 sets the duotone
`.pl__tone` to `.88`, which it is. But the prototype's underlying
`brightness(.86)` was tuned against darker source material, and Prakyat's page
is cream: the tinted plate came back as a pale pink rectangle, which is a
colour filling a rectangle, which Part 0.2 says is wrong. Hover still restores
the truth.

**The Work index rail is sticky, not fixed.** Part 7.3 requires it to clear
content at every breakpoint. Fixed to the viewport it rode over the header and
the close as well as the projects. Sticky inside the rail, on a zero-height
carrier, it is present for exactly as long as there are projects beside it.

**The Method visualisation had no scroll travel.** Part 7.3 names this. The
prototype sets `align-items: start` on the grid, which sizes the left column to
its own content — so the sticky visualisation had nowhere to travel and
scrolled away while the steps kept going. The column now stretches to the full
row and it pins across the whole 210vh.

**The home page keeps a work index.** Part 4.1 and 5.2 do not list one, but the
v15 prototype has a four-entry work section and nothing in the prototypes may
be lost. It is condensed to four rows — number, kind, name, one line — each
linking through to its entry on `/work`, so it states the work without
duplicating the Work page.

**The static bearing plate is a generated asset, not JSX.** Inlined, seventeen
hundred segments were serialised twice into every static page — once as markup
and once into the RSC payload — putting 86KB of geometry into the home
document. `scripts/generate-field.mts` writes it to `public/field/` at
prebuild. The home document went from 47KB to 7.7KB gzipped. The plate stays
after stage 3 as the reduced-motion and no-JavaScript answer.

---

## The GitHub organisation — added

`https://github.com/Tycherra` is missing from the design and from every part of
the specification, including Part 9's `sameAs`, which names GitHub but was
never given a place to appear. It is carried in `content/site.ts` and surfaces
in four places so far:

- the footer's fourth column, **Elsewhere**, with an inline SVG glyph
- the contact aside, under *Or reach us directly*, beside email and WhatsApp
- the close of `/work`, as *Code — github.com/Tycherra*
- `Organization` and `LocalBusiness` JSON-LD `sameAs`

Three more places are queued for the stages that create them: the mobile sheet
footer alongside email and WhatsApp (stage 2), the `console.log` bearing dial's
hiring line (stage 5), and — if the repositories are public and you want them
named — a per-project source link on Curiosity Engine, which the copy already
describes as open source. `content/work.ts` has no `repo` field yet because no
repository URL has been confirmed.

---

## Known gaps

- `NEXT_PUBLIC_SITE_URL` is unset; canonicals fall back to `tycherra.com`.
- No favicon or icon set yet — Part 8.3, stage 5.
- `npm audit` reports two high advisories, both transitive inside `next`
  itself (`postcss`, `sharp`). `npm audit fix --force` would downgrade Next to
  9.3.3. A `sharp` override to `^0.35.3` is in `package.json`; the `postcss`
  copy is vendored inside `next` and clears when Next ships a patched release.
