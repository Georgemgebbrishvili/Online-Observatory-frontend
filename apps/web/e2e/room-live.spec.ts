import { expect, test, type Page } from "@playwright/test";

import { roomCopy } from "../src/i18n/resources/room";

// Phase 4 slice 2, against e2e/fake-platform.mjs: the session start, the mission channel
// over the web app's /ws proxy, and the MJPEG stream. The `fake_live` cookie picks the
// fake's scenario for this browser context only, so parallel tests never share one.
const observing = "20000000-0000-4000-8000-000000000001";
const scheduled = "21000000-0000-4000-8000-000000000002";

async function scenario(page: Page, value: string) {
  await page
    .context()
    .addCookies([{ name: "fake_live", value, url: "http://localhost:3100" }]);
}

function feedStatus(page: Page) {
  return page.locator(".live-feed-status [role]");
}

test("an observing mission opens its session and shows the simulated stream", async ({
  page,
}) => {
  await page.goto(`/en/app/missions/${observing}/session`);

  const stream = page.getByRole("img", {
    name: "Simulated live view of Hercules Cluster",
  });
  await expect(stream).toBeVisible();
  // The MJPEG stream decodes: the frame reached the page through the /stream proxy.
  await expect
    .poll(() => stream.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(stream).toHaveAttribute(
    "src",
    new RegExp(`^http://localhost:3100/stream/mission/${observing}\\?t=`),
  );

  const feed = page.locator(".live-feed");
  await expect(feed).toHaveAttribute("data-live-status", "live");
  await expect(feed.getByText("Simulated", { exact: true })).toBeVisible();
  await expect(feedStatus(page)).toContainText("Simulator output, not telescope output.");
  // The red LIVE dot is a real camera's only.
  await expect(feed.locator(".live-indicator-active")).toHaveCount(0);
  await expect(feed.getByText(/Time left/)).toBeVisible();
  await expect(page.getByText("Illustration — not telescope output")).toHaveCount(0);
});

test("the Georgian live room fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/ka/app/missions/${observing}/session`);

  await expect(
    page.getByRole("img", { name: "სიმულირებული პირდაპირი ხედი: ჰერკულესის გროვა" }),
  ).toBeVisible();
  await expect(page.locator(".live-feed").getByText("სიმულირებული")).toBeVisible();
  await expect(page.getByText(/დარჩენილი დრო/)).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  const box = await page.locator(".live-feed").boundingBox();
  expect(box?.x).toBeGreaterThanOrEqual(16);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390 - 16);
});

test("starting is stated while the platform opens the session", async ({ page }) => {
  await scenario(page, "slow");
  await page.goto(`/en/app/missions/${observing}/session`);
  await expect(feedStatus(page)).toContainText("Starting");
  await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
});

for (const [locale, opens, button] of [
  ["en", "Your slot opens at", "Start observation"],
  ["ka", "თქვენი დრო", "დაიწყე დაკვირვება"],
] as const) {
  test(`${locale}: a scheduled mission waits for its slot, with the plate as an illustration`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/app/missions/${scheduled}/session`);
    await expect(feedStatus(page)).toContainText(opens);
    await expect(page.getByRole("button", { name: button })).toBeDisabled();
    await expect(page.locator(".target-preview img")).toHaveAttribute(
      "src",
      "/plates/saturn.webp",
    );
    await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  });
}

test("the customer starts a scheduled mission once its slot is open", async ({
  page,
}) => {
  await scenario(page, "open");
  // The fake's slot is 2030-01-15 18:00 UTC; the browser reads it five minutes in.
  await page.clock.setFixedTime(new Date("2030-01-15T18:05:00.000Z"));
  await page.goto(`/en/app/missions/${scheduled}/session`);

  const start = page.getByRole("button", { name: "Start observation" });
  await expect(start).toBeEnabled();
  await expect(feedStatus(page)).toContainText(
    "Your slot is open. Starting turns the telescope to Saturn.",
  );
  await start.click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Moving telescope to Saturn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Progress" }).getByText("Step 2 of 5"),
  ).toBeVisible();
  await expect(feedStatus(page)).toContainText("Connecting");
  await expect(page.getByRole("button", { name: "Start observation" })).toHaveCount(0);

  // The dial follows the mount from the channel: it travels while slewing and settles
  // on Saturn's position once centring.
  const pointing = page.getByRole("region", { name: "Where the telescope points" });
  await expect(pointing.locator(".pointing-dial-telescope")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Centring the target" }),
  ).toBeVisible();
  await expect(pointing.locator('[data-pointing="altitude"]')).toHaveText("38.0°");
  await expect(pointing.locator('[data-pointing="azimuth"]')).toHaveText("160.0°");
  await expect(pointing.locator(".pointing-dial-reference")).toBeVisible();
});

for (const [locale, text] of [
  ["en", "Reconnecting"],
  ["ka", "კავშირი აღდგება"],
] as const) {
  test(`${locale}: a dropped channel is stated as reconnecting`, async ({ page }) => {
    await scenario(page, "drop");
    await page.goto(`/${locale}/app/missions/${observing}/session`);
    await expect(feedStatus(page)).toContainText(text);
  });
}

for (const [locale, text, noPosition] of [
  ["en", "Observatory offline", "The telescope has not reported a position."],
  ["ka", "ობსერვატორია ოფლაინშია", "ტელესკოპს მდებარეობა ჯერ არ გადმოუცია."],
] as const) {
  test(`${locale}: an offline agent is stated, with no telescope position`, async ({
    page,
  }) => {
    await scenario(page, "offline");
    await page.goto(`/${locale}/app/missions/${observing}/session`);
    // The start, the channel and its first message: a round trip or three, not a render.
    await expect(feedStatus(page)).toContainText(text, { timeout: 15_000 });
    await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
    await expect(page.getByText(noPosition)).toBeVisible();
    await expect(page.locator(".pointing-dial-telescope")).toHaveCount(0);
  });
}

for (const [locale, heading, reason] of [
  ["en", "Weather hold", "The weather is not safe for observing."],
  ["ka", "მისია ამინდის გამო შეჩერდა", "ამინდი დაკვირვებისთვის უსაფრთხო არ არის."],
] as const) {
  test(`${locale}: a weather hold from the channel stops the feed`, async ({ page }) => {
    await scenario(page, "hold");
    await page.goto(`/${locale}/app/missions/${observing}/session`);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(reason)).toBeVisible();
    await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "hold");
  });
}

for (const [locale, text] of [
  ["en", "Your time is up"],
  ["ka", "დრო ამოიწურა"],
] as const) {
  test(`${locale}: the session ends at its expiresAt`, async ({ page }) => {
    await scenario(page, "expire");
    await page.goto(`/${locale}/app/missions/${observing}/session`);
    await expect(feedStatus(page)).toContainText(text, { timeout: 15_000 });
    await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  });
}

for (const [locale, text, retry] of [
  ["en", "Something went wrong", "Try again"],
  ["ka", "რაღაც შეფერხდა", "სცადე თავიდან"],
] as const) {
  test(`${locale}: a start the platform fails is an error with a retry`, async ({
    page,
  }) => {
    await scenario(page, "error");
    await page.goto(`/${locale}/app/missions/${observing}/session`);
    await expect(feedStatus(page)).toContainText(text);
    await expect(page.getByRole("button", { name: retry })).toBeVisible();
  });
}

// A4: an observation stopped short is a designed screen: the state, the reason, what
// happens next, and the way forward. Each arrives on the channel after the session opened.
const stops = [
  {
    scenario: "not-visible",
    reason: "TARGET_SET_BELOW_LIMIT",
    heading: { en: "Target not visible", ka: "ობიექტი არ ჩანს" },
  },
  {
    scenario: "hardware",
    reason: "MOUNT_FAULT",
    heading: { en: "Observatory hardware error", ka: "ობსერვატორიის აპარატურის შეცდომა" },
  },
  {
    scenario: "cancelled",
    reason: "OPERATOR_ABORT",
    heading: { en: "Mission cancelled", ka: "მისია გაუქმებულია" },
  },
  {
    scenario: "failed",
    reason: "CENTERING_ITERATIONS_EXHAUSTED",
    heading: { en: "Mission failed", ka: "მისია ვერ შესრულდა" },
  },
  {
    // Heartbeat loss: the link goes, and the cloud closes the mission out.
    scenario: "heartbeat",
    reason: "AGENT_LINK_LOST",
    heading: { en: "Mission failed", ka: "მისია ვერ შესრულდა" },
  },
] as const;

for (const stop of stops) {
  for (const locale of ["en", "ka"] as const) {
    test(`${locale}: ${stop.scenario} stops the observation, with a way forward`, async ({
      page,
    }) => {
      const heading = stop.heading[locale];
      const actions =
        locale === "en"
          ? { book: "Book another night", booking: "See your booking" }
          : { book: "დაჯავშნე სხვა ღამე", booking: "ჯავშნის ნახვა" };
      await scenario(page, stop.scenario);
      await page.goto(`/${locale}/app/missions/${observing}/session`);

      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator(".live-feed")).toHaveAttribute(
        "data-live-status",
        "stopped",
      );
      await expect(page.locator(".room-reason")).toHaveText(
        roomCopy[locale].reasons[stop.reason],
      );
      await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
      await expect(page.getByRole("link", { name: actions.book })).toHaveAttribute(
        "href",
        `/${locale}/app/book`,
      );
      await expect(page.getByRole("link", { name: actions.booking })).toHaveAttribute(
        "href",
        `/${locale}/app/bookings/50000000-0000-4000-8000-000000000001`,
      );
    });
  }
}

test("a session another tab holds offers to watch here", async ({ page }) => {
  await scenario(page, "forbidden");
  await page.goto(`/en/app/missions/${observing}/session`);
  await expect(feedStatus(page)).toContainText(
    "This observation is open in another window or tab.",
  );
  await expect(page.getByRole("button", { name: "Watch here" })).toBeVisible();
});
