#!/usr/bin/env node
// Regenerates the TypeScript + Zod client artifacts from the pinned copy of the
// platform contract at packages/contracts/openapi.yaml.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function generateTypeScript(outputDirectory) {
  execFileSync(path.join(repositoryRoot, "node_modules/.bin/openapi-ts"), {
    cwd: path.join(repositoryRoot, "packages/contracts"),
    env: outputDirectory
      ? { ...process.env, DARKVIEW_CONTRACTS_OUT: outputDirectory }
      : process.env,
    stdio: "inherit",
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateTypeScript();
  console.log("\ncontracts: TypeScript + Zod -> packages/contracts/generated");
}
