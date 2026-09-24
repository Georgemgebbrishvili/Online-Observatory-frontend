/**
 * Fails if a built stylesheet still contains `@media (--name)`.
 *
 * `@custom-media` is scoped to the PostCSS entry that declares it. `breakpoints.css`
 * is imported by `globals.css`, but every page-level stylesheet is its own entry, so
 * without `@csstools/postcss-global-data` their named queries ship through unresolved.
 * A browser ignores `@media (--md)` entirely: the rules inside it simply never apply,
 * with no error, no warning and no visual clue beyond a layout that quietly reverts to
 * its mobile form. That happened once, to 33 queries across 15 stylesheets, and the
 * test suite only caught it because one page overflowed.
 *
 * Run after `next build`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "apps/web/.next";
const unresolved = /@media\s*\(\s*--[a-z-]+\s*\)/g;
const offenders = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".css")) {
      const matches = readFileSync(path, "utf8").match(unresolved);
      if (matches) offenders.push({ path, matches: [...new Set(matches)] });
    }
  }
}

try {
  walk(root);
} catch {
  console.error(`css: no build found at ${root}. Run "npm run build" first.`);
  process.exit(1);
}

if (offenders.length > 0) {
  console.error("css: named breakpoints reached the browser unresolved.\n");
  for (const { path, matches } of offenders) {
    console.error(`  ${path}\n    ${matches.join(", ")}`);
  }
  console.error(
    "\nEvery rule inside those blocks is dead. Check that postcss.config.mjs still" +
      "\nfeeds breakpoints.css to @csstools/postcss-global-data.",
  );
  process.exit(1);
}

console.log("css: every named breakpoint resolved to a real width");
