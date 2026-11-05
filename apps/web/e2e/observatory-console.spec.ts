import { expect, test, type Page } from "@playwright/test";

/**
 * ADR-054: the console drives a NexStar 8SE, and the same controls drive the real one.
 * `?turbo` runs the model's GoTo and solves eight times faster so a session fits a test;
 * the sky, the rates and the readings are the model's own.
 */

// The model's sky is the browser's clock. An evening when Albireo is up, so the GoTo is
// not refused for the hour the suite happens to run; the clock runs on from there. Only
// for the model: the real instrument's commands expire on the platform's clock.
const evening = new Date("2026-09-25T20:00:00+04:00");

const view = (page: Page) => page.getByRole("region", { name: "Telescope view" });
const status = (page: Page) => view(page).getByRole("status");
const altitude = (page: Page) =>
  page.getByRole("region", { name: "Pointing" }).locator(".sdo-point__vals > div").first().locator(".sdo-v");

async function onTarget(page: Page) {
  await page.goto("/en/observatory?turbo");
  await expect(page.locator(".oh")).not.toHaveAttribute("aria-busy", "true");
  await page.getByRole("button", { name: /FIND & TRACK/ }).click();
  await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 60_000 });
  await expect(view(page).getByText(/Centred|Off target/)).toBeVisible();
}

const degrees = (text: string | null) => Number((text ?? "").replace(/[^\d.−-]/g, "").replace("−", "-"));

test.describe("the sky model's 8SE", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: evening });
  });

  test("is the 8-inch Schmidt-Cassegrain, framed by the 585", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/observatory");
    // The console sizes itself and takes its handlers once mounted.
    await expect(page.locator(".oh")).not.toHaveAttribute("aria-busy", "true");

    // The station's details are the maker's numbers, on the Setup tab.
    await page.getByRole("tab", { name: "Setup" }).click();
    const setup = page.getByRole("tabpanel");
    await expect(setup.getByText("203 mm Schmidt-Cassegrain")).toBeVisible();
    await expect(setup.getByText("203.2 mm")).toBeVisible();
    await expect(setup.getByText("2032 mm")).toBeVisible();
    await expect(setup.getByText("0.57″")).toBeVisible();
    await expect(setup.getByText(/3840 × 2160 · 2.9 µm/)).toBeVisible();
    await page.getByRole("tab", { name: "Mount" }).click();

    // The field at native focal length, and the three trains and three read-out regions.
    await expect(view(page).getByText(/Field 18\.8′ × 10\.6′/)).toBeVisible();
    await expect(view(page).getByText(/0\.29″ \/ PX/)).toBeVisible();
    const trains = view(page).getByRole("group", { name: "Optical train" }).first();
    await expect(trains.getByRole("button")).toHaveText(["f/6.3", "f/10", "f/20"]);
    await trains.getByRole("button", { name: "f/20" }).click();
    await expect(view(page).getByText(/Field 9\.4′ × 5\.3′/)).toBeVisible();
    await view(page).getByRole("group", { name: "Read-out region" }).getByRole("button", { name: "640" }).click();
    await expect(view(page).getByText(/Field 1\.6′ × 1\.2′/)).toBeVisible();

    // The slew pad's rates are the manual's; the camera's exposures are the sensor's.
    const hand = page.getByRole("region", { name: "Hand control" });
    await expect(page.locator(".oh-slewcard .oh-rate__pill")).toHaveText("Rate 5");
    await hand.getByRole("button", { name: "Slew rate: more" }).click({ clickCount: 4 });
    await expect(page.locator(".oh-slewcard .oh-rate__pill")).toHaveText("Rate 9");
    await expect(hand.getByRole("group", { name: "Slew rate" }).locator("output")).toHaveText("9 · 5°/s");
    const camera = page.getByRole("region", { name: "Camera" });
    await expect(camera.getByRole("group", { name: "Exposure" }).locator("output")).toHaveText("8 s");
    for (let i = 0; i < 9; i += 1) await camera.getByRole("button", { name: "Exposure: less" }).click();
    await expect(camera.getByRole("group", { name: "Exposure" }).locator("output")).toHaveText("10 ms");
  });

  test("a hand slew moves the telescope and leaves the object where it is on the sky", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await onTarget(page);
    await expect(view(page).getByText("Centred")).toBeVisible();
    const before = degrees(await altitude(page).textContent());

    // Rate 7, one degree a second, held for a second and a half: the tube climbs and
    // the target, fixed to the sky, falls that far below the centre of the frame.
    const hand = page.getByRole("region", { name: "Hand control" });
    await hand.getByRole("button", { name: "Slew rate: more" }).click({ clickCount: 2 });
    await expect(page.locator(".oh-slewcard .oh-rate__pill")).toHaveText("Rate 7");
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(1500);
    await page.keyboard.up("ArrowUp");
    await expect(view(page).getByText(/Off target .* S$/)).toBeVisible({ timeout: 5_000 });
    await expect.poll(async () => degrees(await altitude(page).textContent()) - before, { timeout: 5_000 }).toBeGreaterThan(0.8);
    // Still tracking the sky from the new position: the offset holds rather than drifting.
    // A busy page takes the key's release late, so wait for the slew to finish first.
    await expect(status(page)).toHaveText(/On target · tracking/);
    let offset: string | null = null;
    await expect
      .poll(
        async () => {
          const previous = offset;
          offset = await view(page).getByText(/Off target/).textContent();
          return offset === previous;
        },
        { intervals: [500], timeout: 10_000 },
      )
      .toBe(true);
    await page.waitForTimeout(2000);
    // The worm's wander is a few arcseconds: the offset holds to within half an arcminute.
    const nums = (t: string | null) => (t ?? "").match(/[\d.]+′/g)!.map((v) => Number(v.replace("′", "")));
    const after = nums(await view(page).getByText(/Off target/).textContent());
    nums(offset).forEach((v, i) => expect(Math.abs(after[i] - v)).toBeLessThan(0.5));

    // Centre: a GoTo back, and the target is centred again.
    await hand.getByRole("button", { name: "Re-centre the target" }).click();
    await expect(status(page)).toHaveText(/Slewing|Plate-solving|Centring/);
    await expect(view(page).getByText("Centred")).toBeVisible({ timeout: 30_000 });
    // Back on target the live stack runs again before the status settles.
    await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 30_000 });
  });

  test("tracking off lets the sky drift; lunar and sidereal are the hand control's rates", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await onTarget(page);
    const hand = page.getByRole("region", { name: "Hand control" });
    const tracking = hand.getByRole("group", { name: "Tracking" });
    await expect(tracking.getByRole("button")).toHaveText(["Off", "Sidereal", "Lunar", "Solar"]);
    await expect(tracking.getByRole("button", { name: "Sidereal" })).toHaveAttribute("aria-pressed", "true");
    await tracking.getByRole("button", { name: "Off" }).click();
    await expect(status(page)).toHaveText(/On target · drifting/);
    await expect(view(page).getByText(/Off target/)).toBeVisible({ timeout: 15_000 });
    await tracking.getByRole("button", { name: "Sidereal" }).click();
    await expect(status(page)).toHaveText(/On target · tracking/);
  });

  test("every control on the console drives the model: camera, focus, sync, settings, coordinates", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await onTarget(page);

    // The camera: Albireo is a showpiece and brings its own recipe; auto exposure reads
    // the picture and settles, and the frames move by hand.
    const camera = page.getByRole("region", { name: "Camera" });
    await expect(camera.getByRole("group", { name: "Exposure" }).locator("output")).toHaveText("50 ms");
    await camera.locator(".oh-ae__auto").click();
    await expect(camera.locator(".oh-ae__status")).toHaveText(/Star.*(locked|limit)/, { timeout: 60_000 });
    await camera.getByRole("button", { name: "Frames to stack: more" }).click();
    await expect(camera.getByRole("group", { name: "Frames to stack" }).locator("output")).toHaveText("100");
    await expect(page.getByRole("button", { name: /^Capture 100 × / })).toBeEnabled();

    // Focus: the dial turns by the keyboard, four steps at this speed; the Focus tab reads the motor.
    const dial = page.getByRole("slider", { name: "Focuser" });
    const start = Number(await dial.getAttribute("aria-valuenow"));
    await dial.focus();
    await page.keyboard.press("ArrowRight");
    await expect(dial).toHaveAttribute("aria-valuenow", String(start + 4), { timeout: 5_000 });
    await page.getByRole("tab", { name: "Focus" }).click();
    await expect(page.getByRole("tabpanel", { name: "Autofocus curve" }).locator(".oh-metric div").first().locator("b")).toHaveText(String(start + 4));
    await page.getByRole("tab", { name: "Mount" }).click();

    // Sync improves the pointing model here; the mount settings are the hand control's.
    const hand = page.getByRole("region", { name: "Hand control" });
    await hand.getByRole("button", { name: "Sync" }).click();
    await expect(hand.getByRole("button", { name: "Synced here" })).toBeVisible();
    await hand.getByRole("button", { name: "Mount settings" }).click();
    const settings = page.getByRole("dialog", { name: "Mount settings" });
    await settings.getByRole("group", { name: "Cordwrap" }).getByRole("button", { name: "On" }).click();
    await expect(settings.getByRole("group", { name: "Cordwrap" }).getByRole("button", { name: "On" })).toHaveAttribute("aria-pressed", "true");
    await settings.getByRole("button", { name: "Altitude max: less" }).click();
    await expect(settings.getByRole("group", { name: "Altitude max" }).locator("output")).toHaveText("85°");
    await settings.getByRole("button", { name: "Close" }).click();

    // A custom target by coordinates, as the hub's Custom tab: refused when malformed, found when well-formed.
    const targets = page.getByRole("region", { name: "Targets" });
    await targets.getByRole("button", { name: "Custom" }).click();
    const form = targets.getByRole("form", { name: "Add a target by coordinates" });
    await form.getByLabel("RA (hh:mm:ss)").fill("25:00:00");
    await form.getByLabel("Dec (±dd:mm:ss)").fill("+10:00:00");
    await form.getByRole("button", { name: "Add target" }).click();
    await expect(form.getByRole("alert")).toBeVisible();
    await form.getByLabel("RA (hh:mm:ss)").fill("19:30:43");
    await form.getByLabel("Dec (±dd:mm:ss)").fill("+27:57:35");
    await form.getByRole("button", { name: "Add target" }).click();
    await page.getByRole("button", { name: /FIND & TRACK/ }).click();
    await expect(status(page)).toHaveText(/Slewing|Plate-solving|Centring/);
    await expect(view(page).getByText(/^19:30:43/)).toBeVisible();
  });

  test("pressing a showpiece on the sky dome runs the whole acquisition and the stack settles", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/observatory?turbo");
    const dome = page.getByRole("region", { name: "Sky tonight" });
    await expect(dome.getByRole("button", { name: /^Albireo · \d+°$/ })).toHaveCount(2);
    // From standby: one press connects, aligns, slews, solves and centres.
    await dome.locator(".sdo-dome__chip", { hasText: "Albireo" }).click();
    await expect(status(page)).toHaveText(/Live stack/, { timeout: 60_000 });
    await expect(view(page).getByRole("group", { name: "Optical train" }).first().getByRole("button", { name: "f/20", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("region", { name: "Camera" }).getByRole("group", { name: "Exposure" }).locator("output")).toHaveText("50 ms");
    // The live stack fills, then the Autopilot's pipeline stands done to TRACK.
    await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 30_000 });
    await expect(page.locator(".oh-pipe .is-done")).toHaveCount(5);
    await expect(dome.locator(".sdo-dome__chip", { hasText: "Albireo" })).toHaveAttribute("aria-pressed", "true");
  });

  test("the Georgian console names the same controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ka/observatory");
    // `next dev`'s own badge sits over the phone's corner button; no visitor sees it.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ობსერვატორია");
    await page.locator(".oh-mtabs").getByRole("button", { name: "მეტი" }).click();
    const hand = page.getByRole("region", { name: "ხელის პულტი" });
    await expect(hand.getByRole("group", { name: "ტრეკინგი" }).getByRole("button")).toHaveText(["გამორთ.", "ვარსკვლავური", "მთვარის", "მზის"]);
    await expect(hand.getByRole("button", { name: "მონტირების პარამეტრები" })).toBeVisible();
  });

  test("the slew pad drives the model: the rate slider, a held arrow, a diagonal", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await onTarget(page);
    const pad = page.getByRole("group", { name: "Mount slew" });
    await page.getByRole("slider", { name: "Slew rate" }).first().fill("8");
    await expect(page.locator(".oh-slewcard .oh-rate__pill")).toHaveText("Rate 8");
    await expect(page.getByRole("region", { name: "Hand control" }).getByRole("group", { name: "Slew rate" }).locator("output")).toHaveText("8 · 3°/s");
    const before = degrees(await altitude(page).textContent());
    await pad.getByRole("button", { name: "Slew up", exact: true }).dispatchEvent("pointerdown", { pointerId: 1 });
    await page.waitForTimeout(800);
    await pad.getByRole("button", { name: "Slew up", exact: true }).dispatchEvent("pointerup", { pointerId: 1 });
    await expect.poll(async () => degrees(await altitude(page).textContent()) - before, { timeout: 5_000 }).toBeGreaterThan(0.5);
    // A diagonal drives both axes: the altitude climbs again as the azimuth turns.
    const mid = degrees(await altitude(page).textContent());
    await pad.getByRole("button", { name: "Slew up · Slew east" }).dispatchEvent("pointerdown", { pointerId: 2 });
    await page.waitForTimeout(600);
    await pad.getByRole("button", { name: "Slew up · Slew east" }).dispatchEvent("pointerup", { pointerId: 2 });
    await expect.poll(async () => degrees(await altitude(page).textContent()) - mid, { timeout: 5_000 }).toBeGreaterThan(0.3);
  });

  test("autofocus reads the picture: the contrast curve, the fit and the best position", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await onTarget(page);
    // Knock the focus out by 300 steps, then let autofocus find its way back.
    const dial = page.getByRole("slider", { name: "Focuser" });
    const start = Number(await dial.getAttribute("aria-valuenow"));
    await dial.focus();
    for (let i = 0; i < 6; i += 1) await page.keyboard.press("Shift+ArrowRight");
    await expect(dial).toHaveAttribute("aria-valuenow", String(start + 240), { timeout: 10_000 });
    await page.locator(".oh-af__run").click();
    await expect(page.locator(".oh-af__run")).toHaveText("Stop autofocus");
    await expect(page.locator(".oh-af__res")).toHaveText(/^Best \d+ · (HFR|contrast)/, { timeout: 180_000 });
    // The stars are smaller than before the run: the focus was knocked out, and found again.
    const m = (await page.locator(".oh-af__res").textContent())!.match(/Best (\d+) · (?:HFR|contrast) ([\d.]+) → ([\d.]+)/)!;
    expect(Number(m[3])).toBeLessThan(Number(m[2]));
    expect(Math.abs(Number(m[1]) - (start + 240))).toBeGreaterThan(100);
    await page.getByRole("tab", { name: "Focus" }).click();
    expect(await page.getByRole("tabpanel", { name: "Autofocus curve" }).locator(".oh-chart circle").count()).toBeGreaterThanOrEqual(16);
  });
});

test.describe("the real instrument", () => {
  // Its own session: the fake keeps REAL per session, so the shared observer's stays simulated.
  test.use({ viewport: { width: 1440, height: 900 }, storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([{ name: "fake_mode", value: "real", url: "http://localhost:3100" }]);
    await page.goto("/en/sign-in");
    await page.getByLabel("Email").fill("observer@darkview.test");
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/app$/, { timeout: 30_000 });
    // One call through /api carries the cookie and the new session together.
    expect((await page.request.get("/api/me")).ok()).toBe(true);
  });

  test("takes the same console: the session reopens, the stream shows, a nudge is relayed and answered", async ({ page }) => {
    await page.goto("/en/observatory");
    // The platform reports REAL: the pill is Live, the booked target is the mission's.
    await expect(page.locator(".oh-head .oh-badge")).toHaveText(/Live/);
    await expect(view(page).getByText("Booked target")).toBeVisible();
    await expect(view(page).getByText("Hercules Cluster", { exact: true })).toBeVisible();
    // Nothing of the model's is offered on the real instrument.
    await expect(page.getByRole("button", { name: /FIND & TRACK/ })).toHaveCount(0);
    const hand = page.getByRole("region", { name: "Hand control" });
    await expect(hand.getByRole("button", { name: "Mount settings" })).toBeDisabled();
    await expect(hand.getByRole("button", { name: "Sync" })).toBeDisabled();
    await expect(page.locator(".oh-apnote")).toHaveText("Your booked target: the platform runs the GoTo.");

    // The booked mission is already observing, so the console reopens its session on
    // arrival, as the live room does; a scheduled one would wait for "Start session".
    await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 15_000 });
    await expect(view(page).getByRole("img", { name: "Live feed" })).toBeVisible();
    await expect(view(page).getByText("Live feed")).toBeVisible();

    // A nudge is one bounded step: relayed, then the agent's verdict.
    const pad = page.getByRole("group", { name: "Mount slew" });
    await pad.getByRole("button", { name: "Slew up", exact: true }).dispatchEvent("pointerdown", { pointerId: 1 });
    await pad.getByRole("button", { name: "Slew up", exact: true }).dispatchEvent("pointerup", { pointerId: 1 });
    await expect(hand.locator("p[role=status]")).toHaveText(/Relayed|Done/);
    await expect(hand.locator("p[role=status]")).toHaveText("Done", { timeout: 10_000 });

    // Capture is the platform's CAPTURE; the session's end is a confirmed stop.
    await page.getByRole("button", { name: "Capture", exact: true }).click();
    await expect(hand.locator("p[role=status]")).toHaveText("Done", { timeout: 10_000 });
    await page.locator(".oh-head").getByRole("button", { name: "STOP" }).click();
    await expect(page.locator(".oh-apnote")).toHaveText("Confirm stop");
  });
});
