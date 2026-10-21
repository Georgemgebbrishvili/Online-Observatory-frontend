import { expect, test, type Page } from "@playwright/test";

/**
 * ADR-054: the console drives a NexStar 8SE, and the same controls drive the real one.
 * `?turbo` runs the model's GoTo and solves eight times faster so a session fits a test;
 * the sky, the rates and the readings are the model's own.
 */

// The model's sky is the browser's clock. An evening when Albireo is up, so the GoTo is
// not refused for the hour the suite happens to run; the clock runs on from there.
const evening = new Date("2026-09-25T20:00:00+04:00");
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: evening });
});

const view = (page: Page) => page.getByRole("region", { name: "Telescope view" });
const status = (page: Page) => view(page).getByRole("status");
const altitude = (page: Page) =>
  page.getByRole("region", { name: "Pointing" }).locator(".sdo-point__vals > div").first().locator(".sdo-v");

async function onTarget(page: Page) {
  await page.goto("/en/observatory?turbo");
  await page.getByRole("button", { name: /Start · Albireo/ }).click();
  await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 60_000 });
  await expect(view(page).getByText(/Centred|Off target/)).toBeVisible();
}

const degrees = (text: string | null) => Number((text ?? "").replace(/[^\d.−-]/g, "").replace("−", "-"));

test.describe("the sky model's 8SE", () => {
  test("is the 8-inch Schmidt-Cassegrain, framed by the 585", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/observatory");

    // The station's details are the maker's numbers.
    await page.getByRole("button", { name: "Station details" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByText("203 mm Schmidt-Cassegrain")).toBeVisible();
    await expect(sheet.getByText("203.2 mm")).toBeVisible();
    await expect(sheet.getByText("2032 mm")).toBeVisible();
    await expect(sheet.getByText("0.57″")).toBeVisible();
    await expect(sheet.getByText(/3840 × 2160 · 2.9 µm/)).toBeVisible();
    await sheet.getByRole("button", { name: "Close" }).click();

    // The field at native focal length, and the three trains and three read-out regions.
    await expect(view(page).getByText(/Field 18\.8′ × 10\.6′/)).toBeVisible();
    await expect(view(page).getByText(/0\.29″ \/ PX/)).toBeVisible();
    const trains = view(page).getByRole("group", { name: "Optical train" }).first();
    await expect(trains.getByRole("button")).toHaveText(["f/6.3", "f/10", "f/20"]);
    await trains.getByRole("button", { name: "f/20" }).click();
    await expect(view(page).getByText(/Field 9\.4′ × 5\.3′/)).toBeVisible();
    await view(page).getByRole("group", { name: "Read-out region" }).getByRole("button", { name: "640" }).click();
    await expect(view(page).getByText(/Field 1\.6′ × 1\.2′/)).toBeVisible();

    // The hand control's rates are the manual's; the camera's exposures are the sensor's.
    const hand = page.getByRole("region", { name: "Hand control" });
    await expect(hand.getByText("Rate 5 · 16×")).toBeVisible();
    await hand.getByRole("button", { name: "Slew rate: more" }).click({ clickCount: 4 });
    await expect(hand.getByText("Rate 9 · 5°/s")).toBeVisible();
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
    await expect(hand.getByText("Rate 7 · 1°/s")).toBeVisible();
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
    await expect(view(page).getByText(/Off target/)).toHaveText(offset ?? "");

    // Centre: a GoTo back, and the target is centred again.
    await hand.getByRole("button", { name: "Re-centre the target" }).click();
    await expect(status(page)).toHaveText(/Slewing|Plate-solving|Centring/);
    await expect(view(page).getByText("Centred")).toBeVisible({ timeout: 30_000 });
    await expect(status(page)).toHaveText(/On target · tracking/);
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

    // The camera: the exposure sets the refresh note; the frames and gain move.
    const camera = page.getByRole("region", { name: "Camera" });
    await expect(camera.getByText(/refreshes every 8 s/)).toBeVisible();
    await camera.getByRole("button", { name: "Auto for target" }).click();
    await expect(camera.getByRole("group", { name: "Exposure" }).locator("output")).toHaveText("1 s");
    await camera.getByRole("button", { name: "Frames to stack: more" }).click();
    await expect(camera.getByRole("group", { name: "Frames to stack" }).locator("output")).toHaveText("16");
    await expect(page.getByRole("button", { name: /^Capture 16 × 1 s/ })).toBeEnabled();

    // Focus: in and out, then autofocus runs its curve and lands at zero.
    const hand = page.getByRole("region", { name: "Hand control" });
    await hand.getByRole("button", { name: "Focus out" }).click({ clickCount: 3 });
    await expect(hand.getByText("Focus +3")).toBeVisible();
    await hand.getByRole("button", { name: "Autofocus" }).click();
    await expect(hand.getByRole("button", { name: "Focusing…" })).toBeDisabled();
    await expect(hand.getByRole("button", { name: "Autofocus" })).toBeEnabled({ timeout: 10_000 });
    await expect(hand.getByText(/^Focus$/)).toBeVisible();

    // Sync improves the pointing model here; the mount settings are the hand control's.
    await hand.getByRole("button", { name: "Sync" }).click();
    await expect(hand.getByRole("button", { name: "Synced here" })).toBeVisible();
    await hand.getByRole("button", { name: "Mount settings" }).click();
    const settings = page.getByRole("dialog", { name: "Mount settings" });
    await settings.getByRole("group", { name: "Cordwrap" }).getByRole("button", { name: "On" }).click();
    await expect(settings.getByRole("group", { name: "Cordwrap" }).getByRole("button", { name: "On" })).toHaveAttribute("aria-pressed", "true");
    await settings.getByRole("button", { name: "Altitude max: less" }).click();
    await expect(settings.getByRole("group", { name: "Altitude max" }).locator("output")).toHaveText("85°");
    await settings.getByRole("button", { name: "Close" }).click();

    // A GoTo by coordinates: refused when malformed, a slew when well-formed.
    await page.getByRole("button", { name: "Change target" }).click();
    const picker = page.getByRole("dialog", { name: "Choose a target" });
    const form = picker.getByRole("form", { name: "Go to coordinates" });
    await form.getByPlaceholder("RA (hh:mm:ss)").fill("25:00:00");
    await form.getByPlaceholder("Dec (±dd:mm:ss)").fill("+10:00:00");
    await form.getByRole("button", { name: "GoTo" }).click();
    await expect(form.getByRole("alert")).toBeVisible();
    await form.getByPlaceholder("RA (hh:mm:ss)").fill("19:30:43");
    await form.getByPlaceholder("Dec (±dd:mm:ss)").fill("+27:57:35");
    await form.getByRole("button", { name: "GoTo" }).click();
    await expect(status(page)).toHaveText(/Slewing|Plate-solving|Centring/);
    await expect(view(page).getByText(/^19:30:43/)).toBeVisible();
  });

  test("the Georgian console names the same controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ka/observatory");
    // `next dev`'s own badge sits over the phone's corner button; no visitor sees it.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ობსერვატორია");
    await page.getByRole("button", { name: "ხელის პულტი" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("group", { name: "ტრეკინგი" }).getByRole("button")).toHaveText(["გამორთ.", "ვარსკვლავური", "მთვარის", "მზის"]);
    await expect(sheet.getByRole("button", { name: "მონტირების პარამეტრები" })).toBeVisible();
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
    await expect(page.locator(".sdo-head .sdo-pill--live")).toHaveText(/Live/);
    await expect(view(page).getByText("Booked target")).toBeVisible();
    await expect(view(page).getByText("Hercules Cluster", { exact: true })).toBeVisible();
    // Nothing of the model's is offered on the real instrument.
    await expect(page.getByRole("button", { name: /Start · / })).toHaveCount(0);
    const hand = page.getByRole("region", { name: "Hand control" });
    await expect(hand.getByRole("button", { name: "Mount settings" })).toBeDisabled();
    await expect(hand.getByRole("button", { name: "Sync" })).toBeDisabled();
    await expect(hand.getByText("2′ steps")).toBeVisible();

    // The booked mission is already observing, so the console reopens its session on
    // arrival, as the live room does; a scheduled one would wait for "Start session".
    await expect(status(page)).toHaveText(/On target · tracking/, { timeout: 15_000 });
    await expect(view(page).getByRole("img", { name: "Live feed" })).toBeVisible();
    await expect(view(page).getByText("Live feed")).toBeVisible();

    // A nudge is one bounded step: relayed, then the agent's verdict.
    await hand.getByRole("button", { name: "Slew up" }).dispatchEvent("pointerdown", { pointerId: 1 });
    await hand.getByRole("button", { name: "Slew up" }).dispatchEvent("pointerup", { pointerId: 1 });
    await expect(hand.locator("p[role=status]")).toHaveText(/Relayed|Done/);
    await expect(hand.locator("p[role=status]")).toHaveText("Done", { timeout: 10_000 });

    // Capture is the platform's CAPTURE; the session's end is a confirmed stop.
    await page.getByRole("button", { name: "Capture", exact: true }).click();
    await expect(hand.locator("p[role=status]")).toHaveText("Done", { timeout: 10_000 });
    const stop = page.getByRole("region", { name: "Session" }).getByRole("button", { name: "Stop observation" });
    await stop.click();
    await expect(page.getByRole("region", { name: "Session" }).getByRole("button", { name: "Confirm stop" })).toBeVisible();
  });
});
