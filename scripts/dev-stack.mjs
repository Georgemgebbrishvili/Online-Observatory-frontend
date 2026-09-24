#!/usr/bin/env node
// The local dev stack: Postgres and MinIO in containers, the platform's API, realtime
// service and simulated agent from the read-only platform checkout, and this web app.
//
//   node scripts/dev-stack.mjs          run everything; Ctrl-C stops it
//   node scripts/dev-stack.mjs setup    first time: install, migrate, seed, agent venv
//   node scripts/dev-stack.mjs fake     this web app against e2e/fake-platform.mjs only
//
// Nothing here writes inside the platform checkout except what its own commands do
// (node_modules, the generated Prisma client, agent/.venv). See CLAUDE.md, "The
// platform repository", and dev/README.md.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.join(repositoryRoot, "dev/docker-compose.yml");
const stateDirectory = path.join(repositoryRoot, "dev/.state");

const API_URL = "http://127.0.0.1:4000";
const AGENT_CLOUD_URL = "ws://localhost:4001/ws/agent";
const FAKE_API_URL = "http://127.0.0.1:4100";

function fail(message) {
  console.error(`\n\x1b[31mdev-stack: ${message}\x1b[0m\n`);
  process.exit(1);
}

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator > 0)
      values[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return values;
}

const local = readEnvFile(path.join(repositoryRoot, "dev/.env.local"));
const platformDir = path.resolve(
  repositoryRoot,
  local.PLATFORM_DIR || "../part-1-platform",
);

// npm run exports npm_* into the environment; a nested npm in another project must
// not inherit this one's workspace or config.
function childEnvironment(extra = {}) {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("npm_")),
  );
  return { ...environment, ...extra };
}

function checkPlatform() {
  const manifest = path.join(platformDir, "package.json");
  if (!fs.existsSync(manifest)) {
    fail(`no platform checkout at ${platformDir}. Set PLATFORM_DIR in dev/.env.local.`);
  }
  if (JSON.parse(fs.readFileSync(manifest, "utf8")).name !== "darkview-platform") {
    fail(`${platformDir} is not a darkview-platform checkout.`);
  }
  if (!fs.existsSync(path.join(platformDir, ".env"))) {
    fail(`${platformDir}/.env is missing. Create it as dev/README.md describes.`);
  }
}

function versionGuard() {
  let head;
  try {
    head = execFileSync("git", ["-C", platformDir, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    console.warn("\x1b[33mdev-stack: cannot read the platform's git HEAD.\x1b[0m");
    return;
  }
  const sourceFile = path.join(repositoryRoot, "packages/contracts/SOURCE.json");
  if (!fs.existsSync(sourceFile)) {
    console.log(
      `dev-stack: platform HEAD ${head} (no packages/contracts/SOURCE.json to compare)`,
    );
    return;
  }
  const synced = JSON.parse(fs.readFileSync(sourceFile, "utf8")).commit;
  if (synced === head) {
    console.log(`dev-stack: platform HEAD ${head} matches the synced contract`);
    return;
  }
  const bar = "!".repeat(78);
  console.warn(
    `\x1b[33m${bar}\n` +
      `  The platform checkout is at ${head}\n` +
      `  but this repository's contract was synced from ${synced}.\n` +
      `  Payloads may not match the generated types. Continuing.\n${bar}\x1b[0m`,
  );
}

function compose(...args) {
  execFileSync("docker", ["compose", "-f", composeFile, ...args], { stdio: "inherit" });
}

function startServices() {
  try {
    execFileSync("docker", ["compose", "version"], { stdio: "ignore" });
  } catch {
    fail(
      "`docker compose` is not available. Install a container runtime (dev/README.md, step 1).",
    );
  }
  compose("up", "--detach", "--wait", "postgres", "minio");
  compose("run", "--rm", "minio-bucket");
}

function readSeedIdentity() {
  const seed = fs.readFileSync(
    path.join(platformDir, "packages/db/prisma/development-seed.ts"),
    "utf8",
  );
  const observatoryId = seed.match(/\bobservatory:\s*"([0-9a-f-]{36})"/)?.[1];
  const deviceToken = seed.match(/DEMO_AGENT_DEVICE_TOKEN\s*=\s*"([^"]+)"/)?.[1];
  if (!observatoryId || !deviceToken) {
    fail(
      "could not read DEMO_IDS.observatory and DEMO_AGENT_DEVICE_TOKEN from development-seed.ts.",
    );
  }
  return { observatoryId, deviceToken };
}

function run(command, args, options = {}) {
  console.log(
    `\n\x1b[1m$ ${command} ${args.join(" ")}\x1b[0m  (in ${options.cwd ?? process.cwd()})`,
  );
  execFileSync(command, args, {
    stdio: "inherit",
    env: childEnvironment(options.env),
    cwd: options.cwd,
  });
}

function setup() {
  checkPlatform();
  versionGuard();
  startServices();

  run("npm", ["ci"], { cwd: platformDir });
  run("npm", ["run", "db:generate"], { cwd: platformDir });
  // The root has no db:deploy; the script lives in the @darkview/db workspace.
  run("npm", ["run", "db:deploy", "--workspace", "@darkview/db"], { cwd: platformDir });
  run("npm", ["run", "db:seed"], { cwd: platformDir, env: { NODE_ENV: "development" } });

  const python = path.join(platformDir, "agent/.venv/bin/python");
  if (!fs.existsSync(python)) {
    run("python3.12", ["-m", "venv", "agent/.venv"], { cwd: platformDir });
  }
  const version = execFileSync(python, ["--version"], { encoding: "utf8" }).trim();
  if (!version.startsWith("Python 3.12.")) {
    fail(
      `agent/.venv is ${version}; the agent needs 3.12. Remove agent/.venv and rerun setup.`,
    );
  }
  run(python, ["-m", "pip", "install", "-r", "agent/requirements-dev.txt"], {
    cwd: platformDir,
  });

  console.log("\n\x1b[32mdev-stack: setup complete. Next: npm run dev:stack\x1b[0m\n");
}

const COLOURS = { fake: 31, mail: 34, api: 36, realtime: 35, agent: 33, web: 32 };
const children = new Map();
let stopping = false;
let usesContainers = false;

function prefixLines(name, stream, target) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines)
      target.write(`\x1b[${COLOURS[name]}m${name.padEnd(8)}|\x1b[0m ${line}\n`);
  });
}

function start(name, command, args, options) {
  // Own process group, so a stop reaches npm's children (next, tsx) as well.
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: childEnvironment(options.env),
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  prefixLines(name, child.stdout, process.stdout);
  prefixLines(name, child.stderr, process.stderr);
  children.set(name, child);
  child.on("exit", (code, signal) => {
    children.delete(name);
    if (!stopping) {
      stopAll(`${name} exited (${signal ?? `code ${code}`}); stopping the rest.`, 1);
    } else if (children.size === 0) {
      console.log(
        usesContainers
          ? "dev-stack: all stopped. Containers are still up: npm run dev:stack:down"
          : "dev-stack: all stopped.",
      );
      process.exit(process.exitCode ?? 0);
    }
  });
}

function stopAll(reason, exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  console.log(`\n\x1b[1mdev-stack: ${reason}\x1b[0m`);
  if (children.size === 0) process.exit(exitCode);
  // SIGTERM, never SIGKILL: the agent parks the mount on SIGTERM (RUNBOOK §4).
  for (const child of children.values()) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {}
  }
}

// A server already on one of these ports would answer the readiness checks below
// for a stack that never started.
async function requireFreePorts(...ports) {
  for (const port of ports) {
    // Both: a server bound to 127.0.0.1 only does not stop a wildcard probe on macOS.
    const free = await Promise.all(
      [undefined, "127.0.0.1"].map(
        (host) =>
          new Promise((resolve) => {
            const probe = net.createServer();
            probe.once("error", () => resolve(false));
            probe.listen(port, host, () => probe.close(() => resolve(true)));
          }),
      ),
    ).then((results) => results.every(Boolean));
    if (!free)
      fail(`port ${port} is already in use. Stop whatever holds it (lsof -i :${port}).`);
  }
}

async function waitFor(url, name, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    if (stopping) return;
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  stopAll(`${name} did not answer ${url} within ${timeoutSeconds}s.`, 1);
}

async function stack() {
  checkPlatform();
  versionGuard();
  const { observatoryId, deviceToken } = readSeedIdentity();
  const python = path.join(platformDir, "agent/.venv/bin/python");
  if (!fs.existsSync(python))
    fail("agent/.venv is missing. Run npm run dev:stack:setup first.");
  if (!local.SITE_LATITUDE || !local.SITE_LONGITUDE) {
    fail("SITE_LATITUDE and SITE_LONGITUDE must be set in dev/.env.local.");
  }

  await requireFreePorts(3000, 4000, 4001, 4010);
  startServices();
  usesContainers = true;

  process.on("SIGINT", () => stopAll("Ctrl-C; stopping."));
  process.on("SIGTERM", () => stopAll("SIGTERM; stopping."));

  // Neither service loads the platform's .env itself (next dev reads only
  // apps/api/.env*, realtime reads process.env), so it is handed to them here.
  const platformEnvironment = readEnvFile(path.join(platformDir, ".env"));

  start("mail", process.execPath, [path.join(repositoryRoot, "dev/mail-sink.mjs")], {
    cwd: repositoryRoot,
    env: {
      EMAIL_VERIFICATION_WEBHOOK_SECRET:
        platformEnvironment.EMAIL_VERIFICATION_WEBHOOK_SECRET,
    },
  });
  start("api", "npm", ["run", "dev", "--workspace", "@darkview/api"], {
    cwd: platformDir,
    env: platformEnvironment,
  });
  start("realtime", "npm", ["run", "dev", "--workspace", "@darkview/realtime"], {
    cwd: platformDir,
    env: platformEnvironment,
  });
  await waitFor(`${API_URL}/health`, "the API", 120);
  if (stopping) return;

  fs.mkdirSync(stateDirectory, { recursive: true });
  start("agent", python, ["-m", "darkview_agent"], {
    cwd: path.join(platformDir, "agent"),
    env: {
      DARKVIEW_AGENT_DRIVER_MODE: "SIMULATED",
      DARKVIEW_AGENT_OBSERVATORY_ID: observatoryId,
      DARKVIEW_AGENT_CLOUD_URL: AGENT_CLOUD_URL,
      DARKVIEW_AGENT_DEVICE_TOKEN: deviceToken,
      DARKVIEW_AGENT_SITE_LATITUDE: local.SITE_LATITUDE,
      DARKVIEW_AGENT_SITE_LONGITUDE: local.SITE_LONGITUDE,
      // Kept in this repository, not ~/.darkview: a dev run must not share state
      // or a setup file with a real installation on the same machine.
      DARKVIEW_AGENT_STATE_PATH: path.join(stateDirectory, "agent-state.sqlite3"),
      DARKVIEW_AGENT_ENV_FILE: path.join(stateDirectory, "agent.env"),
    },
  });

  start("web", "npm", ["run", "dev"], {
    cwd: repositoryRoot,
    env: { DARKVIEW_PLATFORM_API_URL: API_URL },
  });
  await waitFor("http://localhost:3000/en", "the web app", 120);
  if (!stopping)
    console.log(
      "\n\x1b[32mdev-stack: up. Open http://localhost:3000 (not 127.0.0.1).\x1b[0m\n",
    );
}

// The web app against the e2e fake platform: no containers, no platform checkout, no
// clock. Its observatory is simulated and its mission is OBSERVING at any hour.
async function fake() {
  process.on("SIGINT", () => stopAll("Ctrl-C; stopping."));
  process.on("SIGTERM", () => stopAll("SIGTERM; stopping."));

  await requireFreePorts(3000, 4100);
  const webDirectory = path.join(repositoryRoot, "apps/web");
  start("fake", process.execPath, ["e2e/fake-platform.mjs"], { cwd: webDirectory });
  await waitFor(`${FAKE_API_URL}/health`, "the fake platform", 30);
  if (stopping) return;

  start("web", "npm", ["run", "dev"], {
    cwd: repositoryRoot,
    env: { DARKVIEW_PLATFORM_API_URL: FAKE_API_URL },
  });
  await waitFor("http://localhost:3000/en", "the web app", 120);
  if (!stopping)
    console.log(
      "\n\x1b[32mdev-stack: fake mode up. Open http://localhost:3000 (not 127.0.0.1).\x1b[0m\n",
    );
}

if (process.argv[2] === "setup") setup();
else if (process.argv[2] === "fake") await fake();
else if (process.argv[2] === "down") compose("down");
else await stack();
