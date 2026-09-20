/* Copies the static export into ../docs, which is what GitHub Pages serves. */
import { cpSync, rmSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "..");
const OUT = join(process.cwd(), "out");
const DOCS = join(ROOT, "docs");

if (!existsSync(OUT)) {
  console.error("No out/ directory - run `next build` first.");
  process.exit(1);
}
rmSync(DOCS, { recursive: true, force: true });
mkdirSync(DOCS, { recursive: true });
cpSync(OUT, DOCS, { recursive: true });
writeFileSync(join(DOCS, ".nojekyll"), "");
console.log("Copied static export to docs/");
