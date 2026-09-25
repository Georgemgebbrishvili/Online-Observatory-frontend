/**
 * Runs the visual gate inside mcr.microsoft.com/playwright, the only place baselines
 * may come from. `--update` rewrites them; without it, it compares.
 *
 * The image tag follows the pinned @playwright/test, so upgrading Playwright moves the
 * image with it. CI pins the same tag in .github/workflows/ci.yml.
 *
 * node_modules and .next are container-only volumes: the host's are built for macOS
 * and must be neither used nor overwritten from Linux.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const web = JSON.parse(readFileSync(join(root, "apps/web/package.json"), "utf8"));
const version = web.devDependencies["@playwright/test"];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const update = process.argv.includes("--update");

const playwright = [
  // list, not html: the html reporter serves its report on failure and would hang.
  "npx playwright test --project=visual-setup --project=visual --reporter=list",
  update ? "--update-snapshots" : "",
].join(" ");

const result = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--ipc=host",
    "-v",
    `${root}:/work`,
    "-v",
    "/work/node_modules",
    "-v",
    "/work/apps/web/node_modules",
    "-v",
    "/work/packages/contracts/node_modules",
    "-v",
    "/work/apps/web/.next",
    "-w",
    "/work",
    image,
    "bash",
    "-c",
    `npm ci && cd apps/web && ${playwright}`,
  ],
  { stdio: "inherit" },
);

if (result.error?.code === "ENOENT") {
  console.error("visual: docker not found. Install OrbStack or Docker, then rerun.");
  process.exit(1);
}
process.exit(result.status ?? 1);
