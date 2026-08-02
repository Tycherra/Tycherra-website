import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FIELDS, fieldSvg } from "../lib/field.ts";

/*  Writes the static bearing plates into /public/field. Wired to the
    `prebuild` script, so a deploy always regenerates them from the
    generator rather than trusting whatever is committed.

    Run directly with `npm run field` after changing lib/field.ts. */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "field");

await mkdir(out, { recursive: true });

for (const [name, tuning] of Object.entries(FIELDS)) {
  const svg = fieldSvg(tuning);
  await writeFile(join(out, `${name}.svg`), svg, "utf8");
  console.log(
    `field: ${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`,
  );
}
