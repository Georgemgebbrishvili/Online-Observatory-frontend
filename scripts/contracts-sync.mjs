#!/usr/bin/env node
// Copies a released platform contract into packages/contracts/openapi.yaml, regenerates,
// checks, and records where it came from in packages/contracts/SOURCE.json.
//
//   npm run contracts:sync -- contract-v1.2
//   npm run contracts:sync -- <full 40-character commit sha>
//
// The spec is read from the commit with `git show <commit>:contracts/openapi.yaml`, never
// from the platform's working tree, so an uncommitted edit there cannot leak in. The only
// git commands run in the platform checkout are `fetch --tags` and `show` (CLAUDE.md,
// "The platform repository").
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.join(repositoryRoot, "packages/contracts/openapi.yaml");
const sourcePath = path.join(repositoryRoot, "packages/contracts/SOURCE.json");

function fail(message) {
  console.error(`contracts:sync: ${message}`);
  process.exit(1);
}

function platformDirectory() {
  const envFile = path.join(repositoryRoot, "dev/.env.local");
  const configured = fs.existsSync(envFile)
    ? fs
        .readFileSync(envFile, "utf8")
        .split("\n")
        .map((line) => line.trim().match(/^PLATFORM_DIR=(.+)$/)?.[1])
        .find(Boolean)
    : undefined;
  const directory = path.resolve(repositoryRoot, configured ?? "../part-1-platform");
  if (!fs.existsSync(path.join(directory, "contracts/openapi.yaml"))) {
    fail(
      `no darkview-platform checkout at ${directory}. Set PLATFORM_DIR in dev/.env.local.`,
    );
  }
  return directory;
}

function git(directory, ...args) {
  return execFileSync("git", ["-C", directory, ...args], { maxBuffer: 64 * 1024 * 1024 });
}

const ref = process.argv[2];
const isTag = /^contract-v\d+\.\d+(\.\d+)?$/.test(ref ?? "");
const isSha = /^[0-9a-f]{40}$/.test(ref ?? "");
if (!isTag && !isSha) {
  fail("give a contract-vX.Y tag or a full 40-character commit sha.");
}

const platform = platformDirectory();
git(platform, "fetch", "--tags");

// refs/tags/ spelled out, so a branch that happens to share the name is never read.
const revision = isTag ? `refs/tags/${ref}^{commit}` : `${ref}^{commit}`;
let commit;
try {
  commit = git(platform, "show", "--no-patch", "--format=%H", revision).toString().trim();
} catch {
  fail(`${ref} is not a ${isTag ? "tag" : "commit"} in ${platform}.`);
}
if (isSha && commit !== ref) fail(`${ref} resolved to ${commit}.`);

let incoming;
try {
  incoming = git(platform, "show", `${commit}:contracts/openapi.yaml`);
} catch {
  fail(`${commit} has no contracts/openapi.yaml.`);
}

const previous = fs.readFileSync(specPath, "utf8");
fs.writeFileSync(specPath, incoming);
fs.writeFileSync(
  sourcePath,
  `${JSON.stringify(
    {
      ref,
      commit,
      sha256: createHash("sha256").update(incoming).digest("hex"),
      syncedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);

execFileSync("node", [path.join(repositoryRoot, "scripts/contracts-generate.mjs")], {
  stdio: "inherit",
});
execFileSync("node", [path.join(repositoryRoot, "scripts/contracts-check.mjs")], {
  stdio: "inherit",
});

// The summary reads the spec's block layout: paths at two spaces with their methods at
// four, and components.<section>.<Name> at four. It is a reading aid for the commit
// message, not a validator; generation above is what proves the spec.
const METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "head",
  "options",
  "trace",
]);

function outline(text) {
  const operations = new Set();
  const components = new Map();
  let section = null;
  let pathKey = null;
  let componentSection = null;
  let component = null;

  for (const line of text.split("\n")) {
    const top = line.match(/^([A-Za-z][\w-]*):/);
    if (top) {
      section = top[1];
      componentSection = null;
      component = null;
      continue;
    }
    if (section === "paths") {
      const pathMatch = line.match(/^ {2}(\/\S*):\s*$/);
      if (pathMatch) pathKey = pathMatch[1];
      const method = line.match(/^ {4}([a-z]+):\s*$/)?.[1];
      if (pathKey && METHODS.has(method))
        operations.add(`${method.toUpperCase()} ${pathKey}`);
    }
    if (section === "components") {
      const sectionMatch = line.match(/^ {2}(\w+):\s*$/);
      if (sectionMatch) {
        componentSection = sectionMatch[1];
        component = null;
        continue;
      }
      const name = line.match(/^ {4}([\w.-]+):\s*$/)?.[1];
      if (componentSection && name) {
        component = `${componentSection}.${name}`;
        components.set(component, "");
        continue;
      }
      if (component) components.set(component, `${components.get(component)}${line}\n`);
    }
  }
  if (operations.size === 0) fail("found no operations under paths: while summarising.");
  return { operations, components };
}

const before = outline(previous);
const after = outline(incoming.toString("utf8"));
const added = (a, b) => [...b].filter((key) => !a.has(key)).sort();

const report = [
  ["Operations added", added(before.operations, after.operations)],
  ["Operations removed", added(after.operations, before.operations)],
  ["Components added", added(new Set(before.components.keys()), after.components.keys())],
  [
    "Components removed",
    added(new Set(after.components.keys()), before.components.keys()),
  ],
  [
    "Components changed",
    [...after.components.keys()]
      .filter(
        (key) =>
          before.components.has(key) &&
          before.components.get(key) !== after.components.get(key),
      )
      .sort(),
  ],
];

console.log(`\ncontracts:sync: ${ref} -> ${commit}`);
if (previous === incoming.toString("utf8")) {
  console.log("  The spec is byte-identical to the one already pinned.");
} else {
  for (const [heading, keys] of report) {
    if (keys.length === 0) continue;
    console.log(`\n  ${heading} (${keys.length}):`);
    for (const key of keys) console.log(`    ${key}`);
  }
}
console.log("\nChanged files:");
console.log(
  execFileSync("git", ["-C", repositoryRoot, "status", "--short", "packages/contracts"], {
    encoding: "utf8",
  }) || "  none\n",
);
