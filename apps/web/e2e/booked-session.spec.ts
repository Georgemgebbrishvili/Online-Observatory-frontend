import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

// ADR-079 and ADR-080, against e2e/fake-platform.mjs: a booked session from before its
// slot to the telescope parked. Each test books its own mission through
// POST /__test/booked, owned by booker@, whose captures land in no other Collection.
// The fake runs that mission on its own clock; /advance moves it, and the browser's clock
// is moved by the same amount, so the 10-minute dwell and the 30-second cooldown pass in
// a moment. /health stands in for the agent's watchdog on its own picture.
const fake = "http://127.0.0.1:4110";
const origin = { origin: "http://localhost:3100" };
const firstCompile = 90_000;
test.describe.configure({ timeout: 3 * firstCompile });

async function signIn(page: Page) {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("booker@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
}

async function book(request: APIRequestContext, opensInSeconds: number) {
  const response = await request.post(`${fake}/__test/booked`, {
    headers: origin,
    data: { opensInSeconds, minutes: 30 },
  });
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { id: string }).id;
}

/** Moves the fake's mission clock and the browser's by the same amount. */
async function advance(
  page: Page,
  request: APIRequestContext,
  id: string,
  seconds: number,
) {
  const response = await request.post(`${fake}/__test/booked/${id}/advance`, {
    headers: origin,
    data: { seconds },
  });
  expect(response.ok()).toBe(true);
  await page.clock.fastForward(seconds * 1000);
}

async function health(
  request: APIRequestContext,
  id: string,
  imageHealth: Record<string, unknown>,
) {
  const response = await request.post(`${fake}/__test/booked/${id}/health`, {
    headers: origin,
    data: {
      imageHealth: {
        reason: null,
        step: null,
        attempt: null,
        nextRetryAt: null,
        since: new Date().toISOString(),
        ...imageHealth,
      },
    },
  });
  expect(response.ok()).toBe(true);
}

const feedStatus = (page: Page) => page.locator(".live-feed-status [role]");
const heading = (page: Page) => page.getByRole("heading", { level: 1 });

test("a booked session runs from the countdown to the telescope parked", async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.clock.install();
  const id = await book(request, 8);
  await page.goto(`/en/app/missions/${id}/session`);

  // Before the slot: a countdown, and no Start to press.
  await expect(feedStatus(page)).toContainText(
    /Your slot opens at .*, in 0:0\d\. The telescope starts by itself then/,
  );
  await expect(page.getByRole("button", { name: "Start observation" })).toHaveCount(0);

  // The slot opens with the page open: the mission starts by itself and acquires Saturn.
  await expect(heading(page)).toHaveText("Observing Saturn", { timeout: 30_000 });
  await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");

  // The objects up now, Saturn on the telescope.
  const objects = page.getByRole("region", { name: "Objects up now" });
  await expect(objects.locator('li[aria-current="true"]')).toContainText("Saturn");

  // A first capture, of Saturn; the next waits out the cooldown.
  const capture = page.locator(".live-feed-action").getByRole("button");
  await expect(capture).toHaveText("Capture");
  await capture.click();
  await expect(capture).toHaveText(/^Capture again in 0:[0-2]\d$/, { timeout: 15_000 });
  await expect(capture).toBeDisabled();

  // Switching before the 10-minute dwell is refused, in words, and counted down.
  const lock = objects.locator(".room-targets-lock");
  await expect(lock).toContainText(/You can switch in (9|10):\d\d/);
  await objects.getByRole("button", { name: "Switch to Albireo" }).click();
  await expect(objects.locator(".room-controls-status")).toHaveText(
    "The telescope stays at least 10 minutes on each object, to spare its mount.",
  );
  await expect(heading(page)).toHaveText("Observing Saturn");

  // Ten minutes on: the switch is accepted and the telescope goes to Albireo.
  await advance(page, request, id, 600);
  await expect(lock).toHaveCount(0);
  await objects.getByRole("button", { name: "Switch to Albireo" }).click();
  await expect(heading(page)).toHaveText("Observing Albireo", { timeout: 15_000 });
  await expect(objects.locator('li[aria-current="true"]')).toContainText("Albireo");
  await expect(lock).toContainText(/You can switch in (9|10):\d\d/);

  // The picture goes blank and the telescope recovers it, saying what it is doing.
  const picture = page.getByRole("group", { name: "Picture" });
  await health(request, id, {
    status: "RECOVERING",
    reason: "BLANK_FRAME",
    step: "RE_EXPOSE",
    attempt: 1,
  });
  await expect(picture).toContainText("Adjusting the exposure");
  await expect(picture).toContainText("The picture went blank.");
  await health(request, id, {
    status: "RECOVERING",
    reason: "OFF_CENTRE",
    step: "RE_CENTRE",
    attempt: 1,
  });
  await expect(picture).toContainText("Re-centring the object");
  await health(request, id, {
    status: "WAITING",
    reason: "CLOUDS",
    step: "WAIT_FOR_SKY",
  });
  await expect(picture).toContainText("Clouds over the telescope — waiting for a gap");
  await health(request, id, { status: "OK" });
  await expect(picture).not.toHaveAttribute("data-health");

  // Two more captures, of Albireo, the cooldown respected between them.
  await expect(capture).toHaveText("Capture");
  await capture.click();
  await expect(capture).toHaveText(/^Capture again in/, { timeout: 15_000 });
  await advance(page, request, id, 30);
  await expect(capture).toHaveText("Capture");
  await capture.click();
  await expect(capture).toHaveText(/^Capture again in/, { timeout: 15_000 });

  const strip = page.locator(".room-captures [data-capture-strip] > *");
  await expect(strip).toHaveCount(3, { timeout: 15_000 });
  await expect(strip.nth(0)).toContainText("Albireo");
  await expect(strip.nth(2)).toContainText("Saturn");

  // The slot ends: the telescope finishes, parks, and the session says what it kept.
  await advance(page, request, id, 30 * 60);
  await expect(feedStatus(page)).toContainText("Parking the telescope", {
    timeout: 15_000,
  });
  await expect(feedStatus(page)).toContainText("Telescope parked", { timeout: 15_000 });
  await expect(feedStatus(page)).toContainText("3 captures are in your Collection.", {
    timeout: 15_000,
  });
  await expect(page.getByRole("link", { name: "Open your Collection" })).toHaveAttribute(
    "href",
    "/en/app/collection",
  );

  // The Collection keeps all three, newest first; the fake pages it two at a time, so
  // the first capture, of Saturn, is on the next page.
  await page.getByRole("link", { name: "Open your Collection" }).click();
  await expect(page.getByRole("link", { name: "Open capture: Albireo" })).toHaveCount(2, {
    timeout: firstCompile,
  });
  await page.getByRole("link", { name: "Older captures" }).click();
  await expect(page.getByRole("link", { name: "Open capture: Saturn" }).first()).toBeVisible({
    timeout: firstCompile,
  });
});

test("ka: the countdown, the objects up now and the picture's health in Georgian", async ({
  page,
  request,
}) => {
  await signIn(page);
  const id = await book(request, 6);
  await page.goto(`/ka/app/missions/${id}/session`);

  await expect(feedStatus(page)).toContainText(
    /შენი სეანსი .*-ზე იწყება, 0:0\d-ში\. ტელესკოპი მაშინ თავად ჩაირთვება/,
  );
  await expect(heading(page)).toHaveText("დაკვირვება მიმდინარეობს", { timeout: 30_000 });
  const objects = page.getByRole("region", { name: "ახლა ხილული ობიექტები" });
  await expect(objects.locator('li[aria-current="true"]')).toContainText("სატურნი");
  await expect(objects.locator(".room-targets-lock")).toContainText(
    /გადართვა შეგეძლება (9|10):\d\d-ში/,
  );

  await health(request, id, {
    status: "UNRECOVERED",
    reason: "NO_STARS",
  });
  const picture = page.getByRole("group", { name: "გამოსახულება" });
  await expect(picture).toContainText("გამოსახულების აღდგენა ვერ მოხერხდა");
  // UNRECOVERED waives the dwell lock: the customer may switch at once.
  await expect(objects.locator(".room-targets-lock")).toHaveCount(0);
});
