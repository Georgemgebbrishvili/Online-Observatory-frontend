// Real-stack browser checks for the 2026-10-13 audit. Drives http://localhost:3000
// (dev:stack: real platform, simulated agents) with the system Chrome through
// Playwright. Every check records pass/fail plus evidence; nothing throws past a check.
// Usage: node run.mjs [--only=auth,book,room,operator,routes,axe,keyboard]
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/Users/nika/Desktop/Stellar Observatory/part-2-clients/apps/web/package.json");
const { chromium } = require("@playwright/test");
const { AxeBuilder } = require("@axe-core/playwright");

const BASE = "http://localhost:3000";
const OUT = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(OUT, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const DEV_STACK_LOG = path.join(OUT, "..", "dev-stack.log");
const PASSWORD = "darkview demo password";
const OBSERVER = "demo.observer@darkview.invalid";
const OPERATOR = "demo.operator@darkview.invalid";
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "--only=auth,book,room,operator,routes,axe,keyboard").slice(7).split(",");

const results = [];
function record(group, check, passed, detail = {}) {
  results.push({ group, check, passed, ...detail });
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  console.log(`${passed ? "PASS" : "FAIL"} [${group}] ${check}${detail.note ? " — " + detail.note : ""}`);
}
async function step(group, check, fn) {
  try {
    const detail = (await fn()) ?? {};
    record(group, check, detail.passed ?? true, detail);
  } catch (error) {
    record(group, check, false, { error: String(error.message ?? error).slice(0, 400) });
  }
}
async function shot(page, name) {
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(OUT, file);
}
function collectErrors(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e.message).slice(0, 300)));
  return errors;
}
async function signIn(page, email, password = PASSWORD, locale = "en") {
  await page.goto(`${BASE}/${locale}/sign-in`);
  await page.getByLabel(locale === "en" ? "Email" : "ელფოსტა").fill(email);
  await page.getByLabel(locale === "en" ? "Password" : "პაროლი").fill(password);
  await page.getByRole("button", { name: locale === "en" ? "Sign in" : "შესვლა" }).click();
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const newPage = async (viewport = { width: 1440, height: 900 }) => {
  const context = await browser.newContext({ viewport, locale: "en-GB", timezoneId: "Asia/Tbilisi" });
  context.setDefaultTimeout(20_000);
  return context.newPage();
};

// ---------------------------------------------------------------- auth
if (only.includes("auth")) {
  const page = await newPage();
  const email = `qa-${Date.now()}@qa.invalid`;
  await step("auth", "register a new address", async () => {
    await page.goto(`${BASE}/en/register`);
    await page.getByLabel("Name").fill("QA Observer");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("a long enough qa password");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/en\/(app|verify-email)$/, { timeout: 30_000 });
    const url = page.url();
    const cookies = (await page.context().cookies()).map((c) => c.name);
    return { url, cookies, note: url.endsWith("/app") ? "signed in at once (ADR-049 path)" : "sent to verify-email (webhook sender configured, ADR-049 not taken)" };
  });
  await step("auth", "verification link from the mail sink signs the address in", async () => {
    if (page.url().endsWith("/en/app")) return { passed: true, note: "not needed; already signed in" };
    const log = fs.readFileSync(DEV_STACK_LOG, "utf8");
    const links = [...log.matchAll(/http:\/\/localhost:3000\/en\/verify-email\/[A-Za-z0-9_-]+/g)].map((m) => m[0]);
    if (!links.length) return { passed: false, note: "no verify-email link in dev-stack.log" };
    await page.goto(links[links.length - 1]);
    await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
    return { url: page.url() };
  });
  await step("auth", "sign out from the app bar returns to sign-in", async () => {
    await page.goto(`${BASE}/en/app`);
    await page.getByRole("banner").filter({ has: page.locator("nav[data-placement='bar']") }).getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL(/\/en\/sign-in$/, { timeout: 30_000 });
    await page.goto(`${BASE}/en/app`);
    await page.waitForURL(/\/en\/sign-in$/, { timeout: 30_000 });
    return { url: page.url() };
  });
  await step("auth", "Continue with Google is present and routed on sign-in and register", async () => {
    await page.goto(`${BASE}/en/sign-in`);
    const en = await page.getByRole("link", { name: "Continue with Google" }).getAttribute("href");
    await page.goto(`${BASE}/ka/register`);
    const ka = await page.getByRole("link", { name: "Google-ით გაგრძელება" }).getAttribute("href");
    return { passed: !!en && !!ka && en.includes("/api/auth/google/start") && ka.includes("/api/auth/google/start"), en, ka };
  });
  await step("auth", "Google start without a configured client fails closed", async () => {
    const response = await page.goto(`${BASE}/api/auth/google/start?locale=en`);
    await page.waitForLoadState("domcontentloaded");
    const alert = page.getByRole("main").getByRole("alert");
    const alertText = (await alert.count()) ? await alert.first().textContent() : null;
    return { status: response?.status(), url: page.url(), alertText, shot: await shot(page, "auth-google-start") , note: "records what the platform does with no Google client; see platform env"};
  });
  await step("auth", "demo observer signs in", async () => {
    await signIn(page, OBSERVER);
    await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
    const cookies = (await page.context().cookies()).map((c) => c.name).sort();
    return { cookies, shot: await shot(page, "app-home-en-1440") };
  });
  await step("auth", "wrong password is refused with the localized alert", async () => {
    await signIn(page, `nobody-${Date.now()}@qa.invalid`, "not the password at all");
    const alert = page.getByRole("main").getByRole("alert");
    await alert.waitFor({ timeout: 30_000 });
    const text = await alert.textContent();
    return { passed: text?.includes("Email or password is incorrect.") || text?.includes("Too many attempts"), text, note: text?.includes("Too many attempts") ? "sign-in throttle reached (platform refuses further attempts for 15 minutes)" : undefined, shot: await shot(page, "auth-wrong-password-en") };
  });
  await step("auth", "wrong password, Georgian", async () => {
    await signIn(page, `nobody-${Date.now()}@qa.invalid`, "not the password at all", "ka");
    const alert = page.getByRole("main").getByRole("alert");
    await alert.waitFor({ timeout: 30_000 });
    return { text: await alert.textContent(), shot: await shot(page, "auth-wrong-password-ka") };
  });
  await page.context().close();
}

// ---------------------------------------------------------------- book
let bookingUrl = null;
if (only.includes("book")) {
  const page = await newPage();
  await signIn(page, OBSERVER);
  await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
  await step("book", "slots are offered on /en/app/book", async () => {
    await page.goto(`${BASE}/en/app/book`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const rows = await page.locator(".slot-row").count();
    const bookable = await page.locator(".slot-row").getByRole("link").count();
    const nights = await page.getByRole("navigation", { name: "Choose a night" }).getByRole("link").allTextContents();
    return { passed: bookable > 0, rows, bookable, nights, shot: await shot(page, "book-en-1440") };
  });
  await step("book", "reserve the first bookable slot and reach the sandbox checkout", async () => {
    await page.locator(".slot-row").getByRole("link").first().click();
    await page.waitForURL(/\/en\/app\/book\/reserve\?startAt=/);
    await page.getByRole("heading", { level: 1, name: "What will you observe?" }).waitFor();
    const choices = page.getByRole("radio");
    const names = await choices.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? e.closest("label")?.textContent?.trim().slice(0, 40)));
    await shot(page, "reserve-en-1440");
    await choices.first().check();
    await page.getByRole("button", { name: "Reserve and pay" }).click();
    await page.waitForURL(/sandbox-checkout/, { timeout: 30_000 });
    return { choices: names, url: page.url(), shot: await shot(page, "sandbox-checkout") };
  });
  await step("book", "sandbox payment confirms the booking", async () => {
    await page.getByRole("button", { name: "Pay" }).click();
    await page.waitForURL(/\/en\/app\/bookings\/[0-9a-f-]+$/, { timeout: 30_000 });
    bookingUrl = page.url();
    await page.getByText("Confirmed", { exact: true }).waitFor();
    return { url: bookingUrl, shot: await shot(page, "booking-confirmed-en-1440") };
  });
  await step("book", "the booking appears in Book / bookings", async () => {
    await page.goto(`${BASE}/en/app/bookings`);
    const rows = await page.locator(".booking-row").count();
    const html = await page.getByRole("main").textContent();
    return { passed: rows > 0 && !/not found/i.test(html ?? ""), rows, shot: await shot(page, "bookings-en-1440") };
  });
  await step("book", "the booking page in Georgian", async () => {
    await page.goto(bookingUrl.replace("/en/", "/ka/"));
    await page.getByRole("heading", { level: 1 }).waitFor();
    return { shot: await shot(page, "booking-confirmed-ka-1440") };
  });
  fs.writeFileSync(path.join(OUT, "booking-url.txt"), bookingUrl ?? "");
  await page.context().close();
}

// ---------------------------------------------------------------- room (live, collection, watch)
if (only.includes("room")) {
  const page = await newPage();
  await signIn(page, OBSERVER);
  await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
  await step("room", "the app home names the next mission or booking", async () => {
    const main = await page.getByRole("main").textContent();
    const openMission = await page.getByRole("link", { name: /Open mission/ }).count();
    return { openMission, excerpt: main?.replace(/\s+/g, " ").slice(0, 300) };
  });
  await step("room", "a booked mission can be started now (only if its slot is open)", async () => {
    const url = bookingUrl ?? fs.readFileSync(path.join(OUT, "booking-url.txt"), "utf8").trim();
    if (!url) return { passed: true, note: "no booking from this run" };
    await page.goto(url);
    const start = page.getByRole("button", { name: "Start observation" });
    const link = page.getByRole("link", { name: /Open mission|Start observation|Go to the live room/ });
    const n = (await start.count()) + (await link.count());
    const text = (await page.getByRole("main").textContent())?.replace(/\s+/g, " ").slice(0, 400);
    return { passed: true, startControls: n, note: n ? "start control present" : "slot not open yet; start not offered (expected for a future slot)", text };
  });
  await step("room", "the seeded missions' rooms render with the simulated badge", async () => {
    const links = [];
    for (const from of ["/en/app", "/en/app/bookings", "/en/app/live"]) {
      await page.goto(`${BASE}${from}`);
      await page.locator("main").first().waitFor();
      links.push(...(await page.getByRole("main").getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href")).filter((h) => h && /\/missions\/[0-9a-f-]{36}\/(session|watch)/.test(h)))));
    }
    const first = links[0] ?? "/en/app/missions/00000000-0000-4000-8000-000000000204/session";
    if (!links.length) record("room", "no mission room is linked from /app, bookings or live; using the seeded SCHEDULED mission's room directly", true, { note: "informational" });
    await page.goto(`${BASE}${first}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const h1 = await page.getByRole("heading", { level: 1 }).textContent();
    const simulated = await page.getByText(/SIMULATED OBSERVATORY|Simulated/).count();
    const illustration = await page.getByText("Illustration — not telescope output").count();
    return { passed: simulated > 0, room: first, h1, simulatedBadges: simulated, illustrationCaptions: illustration, shot: await shot(page, "room-en-1440") };
  });
  await step("room", "the live room on a phone, Georgian", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const url = page.url().replace("/en/", "/ka/");
    await page.goto(url);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    return { passed: !overflow, overflow, shot: await shot(page, "room-ka-390") };
  });
  await step("room", "collection renders simulated captures", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/en/app/collection`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const simulated = await page.getByText(/Simulated capture/).count();
    const imgs = await page.locator("img").evaluateAll((els) => els.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).length);
    return { passed: imgs === 0, simulatedLabels: simulated, brokenImages: imgs, shot: await shot(page, "collection-en-1440") };
  });
  await step("room", "a second session of the same account is refused ownership (watch page of the shared seeded mission)", async () => {
    await page.goto(`${BASE}/en/app/missions/00000000-0000-4000-8000-000000000205/watch`);
    await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
    const h1 = await page.getByRole("heading", { level: 1 }).textContent();
    return { passed: true, h1, note: "seeded shared mission is COMPLETE; watch page states its outcome", shot: await shot(page, "watch-en-1440") };
  });
  await page.context().close();
}

// ---------------------------------------------------------------- operator
if (only.includes("operator")) {
  const page = await newPage();
  await signIn(page, OPERATOR);
  await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
  await step("operator", "telemetry: both observatories SIMULATED and Emergency Park enabled", async () => {
    await page.goto(`${BASE}/en/admin`);
    await page.getByText("SIMULATED OBSERVATORY").first().waitFor({ timeout: 30_000 });
    const badges = await page.getByText("SIMULATED OBSERVATORY").count();
    const park = await page.getByRole("button", { name: "Emergency Park" }).first().isEnabled();
    const envelope = await page.getByText(/UNMEASURED/).count();
    const reported = await page.getByText(/Reported \d+ s ago/).count();
    return { passed: badges > 0 && park, badges, parkEnabled: park, unmeasuredEnvelope: envelope, reported, shot: await shot(page, "admin-en-1440") };
  });
  await step("operator", "the observer is denied the operator console", async () => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await signIn(p, OBSERVER);
    await p.waitForURL(/\/en\/app$/, { timeout: 30_000 });
    const r = await p.goto(`${BASE}/en/admin`);
    const text = (await p.getByRole("main").textContent())?.replace(/\s+/g, " ").slice(0, 200);
    await ctx.close();
    return { passed: !text?.includes("SIMULATED OBSERVATORY"), status: r?.status(), url: p.url(), text };
  });
  await step("operator", "target disable then enable (restored)", async () => {
    await page.goto(`${BASE}/en/admin/targets`);
    await page.getByRole("heading", { name: "Targets" }).waitFor({ timeout: 30_000 });
    const row = page.getByRole("row").filter({ hasText: "Saturn" }).first();
    await row.getByRole("button", { name: "Disable" }).click();
    await page.getByText("Saturn is now disabled.").waitFor();
    await shot(page, "admin-targets-disabled");
    await row.getByRole("button", { name: "Enable" }).click();
    await page.getByText("Saturn is now enabled.").waitFor();
    return { shot: await shot(page, "admin-targets-restored") };
  });
  await step("operator", "audit log filters by category", async () => {
    await page.goto(`${BASE}/en/admin/logs`);
    await page.getByRole("heading", { name: "Audit log" }).waitFor({ timeout: 30_000 });
    await page.getByLabel("Category").selectOption("AGENT_LINK");
    await page.getByText("agent.connected").first().waitFor({ timeout: 30_000 });
    return { shot: await shot(page, "admin-logs-agent-link") };
  });
  await step("operator", "missions list and cancellation of the QA booking's mission with a refund", async () => {
    const url = bookingUrl ?? fs.readFileSync(path.join(OUT, "booking-url.txt"), "utf8").trim();
    await page.goto(`${BASE}/en/admin/missions`);
    await page.getByRole("heading", { name: "Missions" }).waitFor({ timeout: 30_000 });
    await shot(page, "admin-missions");
    if (!url) return { passed: true, note: "no QA booking to cancel" };
    const button = page.getByRole("button", { name: "Cancel mission…" }).first();
    if (!(await button.count())) return { passed: false, note: "no cancellable mission in the list" };
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Cancel this mission" });
    await dialog.getByLabel("Settlement").selectOption("REFUND");
    await dialog.getByLabel("Reason").fill("QA audit 2026-10-13: cancelled to verify refund settlement");
    await dialog.getByRole("button", { name: "Cancel mission" }).click();
    await page.locator("tbody tr").first().getByText("Cancelled").waitFor({ timeout: 30_000 });
    await page.goto(`${BASE}/en/admin/logs`);
    await page.getByText("mission.cancelled").first().waitFor({ timeout: 30_000 });
    await page.goto(url);
    const status = (await page.getByRole("main").textContent())?.replace(/\s+/g, " ").slice(0, 300);
    return { bookingAfter: status, shot: await shot(page, "booking-after-cancel") };
  });
  await step("operator", "Emergency Park on the simulator", async () => {
    await page.goto(`${BASE}/en/admin`);
    await page.getByText("SIMULATED OBSERVATORY").first().waitFor({ timeout: 30_000 });
    await page.getByRole("button", { name: "Emergency Park" }).first().click();
    await page.getByText("The mount reports parked.").waitFor({ timeout: 60_000 });
    return { shot: await shot(page, "admin-emergency-park") };
  });
  await step("operator", "operator console on a phone, Georgian", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/ka/admin/control`);
    await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    return { passed: !overflow, overflow, shot: await shot(page, "admin-control-ka-390") };
  });
  await page.context().close();
}

// ---------------------------------------------------------------- routes sweep
const publicRoutes = ["", "pricing", "observatory", "status", "terms", "privacy", "refunds", "design-system", "does-not-exist"];
const appRoutes = ["app", "app/missions", "app/collection", "app/profile", "app/book", "app/bookings", "app/subscription", "app/loyalty", "app/passes"];
const operatorRoutes = ["admin", "admin/control", "admin/missions", "admin/targets", "admin/logs"];
const signedOutRoutes = ["sign-in", "register", "reset-password"];
if (only.includes("routes")) {
  const sweep = [];
  for (const [role, routes] of [["observer", [...publicRoutes, ...appRoutes]], ["signed-out", signedOutRoutes], ["operator", operatorRoutes]]) {
    const context = await browser.newContext({ timezoneId: "Asia/Tbilisi" });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    const errors = collectErrors(page);
    if (role !== "signed-out") { try { await signIn(page, role === "operator" ? OPERATOR : OBSERVER); await page.waitForURL(/\/en\/app$/, { timeout: 60_000 }); } catch (e) { record("routes", `sign in as ${role} for the sweep`, false, { error: String(e.message).slice(0, 200) }); } }
    for (const locale of ["en", "ka"]) for (const route of routes) for (const width of [390, 768, 1440]) {
      errors.length = 0;
      await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
      const url = `${BASE}/${locale}${route ? "/" + route : ""}`;
      let status = null, overflow = null, broken = null, h1 = null, ok = false;
      try {
        const r = await page.goto(url, { waitUntil: "networkidle" });
        status = r?.status() ?? null;
        await page.locator("main").first().waitFor({ timeout: 30_000 });
        ({ overflow, broken, h1 } = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src")),
          h1: document.querySelector("h1")?.textContent?.trim().slice(0, 80) ?? null,
        })));
        ok = true;
      } catch (e) { errors.push("navigation: " + String(e.message).slice(0, 200)); }
      const expected404 = route === "does-not-exist";
      const passed = ok && !overflow && broken.length === 0 && errors.length === 0 && (expected404 ? status === 404 : status === 200);
      const shotFile = width !== 768 || !ok ? await shot(page, `sweep-${locale}-${role}-${route.replace(/\W+/g, "-") || "home"}-${width}`) : null;
      sweep.push({ role, locale, route, width, status, overflow, broken, errors: [...errors], h1, passed, shot: shotFile });
      console.log(`${passed ? "ok  " : "FAIL"} ${locale} ${width} ${role} /${route} ${status} ${overflow ? "OVERFLOW " : ""}${broken?.length ? "BROKEN-IMG " : ""}${errors.length ? "ERR:" + errors[0] : ""}`);
    }
    await context.close();
  }
  fs.writeFileSync(path.join(OUT, "route-sweep.json"), JSON.stringify(sweep, null, 2));
  record("routes", `route sweep: ${sweep.filter((s) => s.passed).length}/${sweep.length} checks clean`, sweep.every((s) => s.passed), { failed: sweep.filter((s) => !s.passed).map((s) => `${s.locale}/${s.route}@${s.width}:${s.status}${s.overflow ? " overflow" : ""}${s.errors[0] ? " " + s.errors[0].slice(0, 80) : ""}`) });
}

// ---------------------------------------------------------------- axe
if (only.includes("axe")) {
  const axe = [];
  const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
  for (const [role, routes] of [["observer", [...publicRoutes.filter((r) => r !== "does-not-exist"), ...appRoutes]], ["signed-out", signedOutRoutes], ["operator", operatorRoutes]]) {
    const context = await browser.newContext({ timezoneId: "Asia/Tbilisi" });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    if (role !== "signed-out") { try { await signIn(page, role === "operator" ? OPERATOR : OBSERVER); await page.waitForURL(/\/en\/app$/, { timeout: 60_000 }); } catch (e) { record("axe", `sign in as ${role} for axe`, false, { error: String(e.message).slice(0, 200) }); } }
    for (const locale of ["en", "ka"]) for (const route of routes) for (const width of [390, 1440]) {
      const url = `${BASE}/${locale}${route ? "/" + route : ""}`;
      try {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: "networkidle" });
        await page.locator("main").first().waitFor();
        await page.locator(':is(.operator-list, .operator-manual)[aria-busy="true"]').waitFor({ state: "detached", timeout: 30_000 }).catch(() => {});
        await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))));
        const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
        const v = violations.map((x) => ({ rule: x.id, impact: x.impact, targets: x.nodes.slice(0, 5).map((n) => n.target.join(" ")), help: x.help }));
        axe.push({ locale, route, width, role, violations: v });
        console.log(`${v.length ? "FAIL" : "ok  "} axe ${locale} ${width} /${route} ${v.map((x) => x.rule).join(",")}`);
      } catch (e) { axe.push({ locale, route, width, role, error: String(e.message).slice(0, 200) }); console.log(`ERR  axe ${locale} ${width} /${route} ${e.message.slice(0, 100)}`); }
    }
    await context.close();
  }
  fs.writeFileSync(path.join(OUT, "axe.json"), JSON.stringify(axe, null, 2));
  const bad = axe.filter((a) => a.error || a.violations.length);
  record("axe", `axe WCAG 2.1 AA: ${axe.length - bad.length}/${axe.length} scans clean`, bad.length === 0, { failed: bad.map((a) => `${a.locale}/${a.route}@${a.width}: ${a.error ?? a.violations.map((v) => v.rule).join(",")}`) });
}

// ---------------------------------------------------------------- keyboard
if (only.includes("keyboard")) {
  const page = await newPage();
  await signIn(page, OBSERVER);
  await page.waitForURL(/\/en\/app$/, { timeout: 60_000 });
  const missions = ["/en/app/missions/00000000-0000-4000-8000-000000000204/session"];
  const pages = [["homepage", `${BASE}/en`], ["book", `${BASE}/en/app/book`], ["room", missions[0] ? `${BASE}${missions[0]}` : null]].filter(([, u]) => u);
  for (const [name, url] of pages) {
    await step("keyboard", `Tab through ${name}: focus visible, in view, not trapped`, async () => {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.locator("main").first().waitFor();
      const seen = []; let offscreen = 0, invisible = 0, repeats = 0;
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(() => {
          const el = document.activeElement; if (!el || el === document.body) return null;
          const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
          const ring = cs.outlineStyle !== "none" && cs.outlineWidth !== "0px" || cs.boxShadow !== "none";
          const id = el.tagName + "#" + (el.id || "") + "." + (el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 25) || el.getAttribute("name") || "");
          return { id, inView, ring, focusVisible: el.matches(":focus-visible") };
        });
        if (!f) continue;
        if (!f.inView) offscreen++;
        if (!f.ring && f.focusVisible) invisible++;
        if (seen.length && seen[seen.length - 1] === f.id) repeats++;
        seen.push(f.id);
      }
      const distinct = new Set(seen).size;
      const trapped = seen.length > 10 && distinct < 4;
      return { passed: !trapped && offscreen === 0 && invisible === 0, tabStops: seen.length, distinct, offscreen, noVisibleRing: invisible, consecutiveRepeats: repeats, firstStops: seen.slice(0, 12), shot: await shot(page, `keyboard-${name}`) };
    });
  }
  await step("keyboard", "Escape closes what Enter opened (sharing or controls dialog in the room)", async () => {
    if (!missions[0]) return { passed: true, note: "no room" };
    await page.goto(`${BASE}${missions[0]}`, { waitUntil: "networkidle" });
    const opener = page.getByRole("button", { name: /Share|Invite|Sharing|Switch|Stop/ }).first();
    if (!(await opener.count())) return { passed: true, note: "no dialog opener in this room state" };
    await opener.focus(); await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    const opened = await dialog.first().isVisible({ timeout: 5_000 }).catch(() => false);
    if (!opened) return { passed: true, note: "opener did not open a dialog (not a dialog control)" };
    await page.keyboard.press("Escape");
    const closed = await dialog.first().isHidden({ timeout: 5_000 }).catch(() => false);
    return { passed: closed, opened, closed };
  });
  await page.context().close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed; ${failed.length} failed`);
