import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";

// ADR-066, against e2e/fake-platform.mjs. The page reads the platform on the server,
// which forwards only the session cookies, so a signed-out scenario is set on the fake
// itself (PUT /__test/tonight) and put back to "none" after every test. Signed-in reads
// never see it, so the rest of the suite does not either.
const observing = "20000000-0000-4000-8000-000000000001";
const firstCompile = 90_000;

test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

async function scenario(request: APIRequestContext, name: string) {
  const response = await request.put("http://127.0.0.1:4110/__test/tonight", {
    headers: { origin: "http://localhost:3100" },
    data: { scenario: name },
  });
  expect(response.ok()).toBe(true);
}

async function stranger(browser: Browser) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  return { context, page: await context.newPage() };
}

test.afterEach(async ({ request }) => {
  await scenario(request, "none");
});

test("a stranger watches a simulated session: the feed, badged, and an invitation", async ({
  browser,
  request,
}) => {
  await scenario(request, "live");
  const { context, page } = await stranger(browser);
  const response = await page.goto("/en/tonight", { timeout: firstCompile });
  expect(response?.status()).toBe(200);

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Saturn, from the observatory in Georgia",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("On target. The picture builds as frames stack."),
  ).toBeVisible();
  await expect(page.getByText("Until 00:30")).toBeVisible();
  const feed = page.getByRole("img", { name: "Simulated live view of Saturn" });
  await expect(feed).toHaveAttribute("src", `/stream/mission/${observing}/spectate`);
  // The frame arrives through the web app's rewrite, with no session.
  await expect
    .poll(() => feed.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator(".tonight-feed .capture-simulated")).toHaveText("Simulated");
  await expect(page.getByRole("link", { name: "Book your own night" })).toHaveAttribute(
    "href",
    "/en/app/book",
  );
  // Nobody is named and nothing can be controlled.
  await expect(page.getByText("observer@darkview.test")).toHaveCount(0);
  await expect(page.locator("main button")).toHaveCount(0);
  await context.close();
});

test("a real session carries no Simulated badge", async ({ browser, request }) => {
  await scenario(request, "live-real");
  const { context, page } = await stranger(browser);
  await page.goto("/en/tonight", { timeout: firstCompile });
  await expect(page.getByRole("img", { name: "Live view of Saturn" })).toBeVisible();
  await expect(page.getByText("Simulated", { exact: true })).toHaveCount(0);
  await context.close();
});

test("the same session in Georgian", async ({ browser, request }) => {
  await scenario(request, "live");
  const { context, page } = await stranger(browser);
  await page.goto("/ka/tonight", { timeout: firstCompile });
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "სატურნი, ობსერვატორიიდან საქართველოში",
    }),
  ).toBeVisible();
  await expect(page.getByText("00:30-მდე")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "სიმულირებული პირდაპირი გამოსახულება: სატურნი" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "დაჯავშნე სეანსი" })).toHaveAttribute(
    "href",
    "/ka/app/book",
  );
  await context.close();
});

test("the twenty-first spectator is told it is full and offered a night", async ({
  browser,
  request,
}) => {
  await scenario(request, "full");
  const { context, page } = await stranger(browser);
  const spectate = page.waitForResponse((answer) => answer.url().includes("/spectate"));
  await page.goto("/en/tonight", { timeout: firstCompile });
  expect((await spectate).status()).toBe(503);

  const unavailable = page.getByRole("status").filter({ hasText: "The view is full" });
  await expect(unavailable).toContainText("Up to twenty people can watch at once.");
  await expect(
    unavailable.getByRole("link", { name: "Book your own night" }),
  ).toBeVisible();

  // Room again: Try again loads the view.
  await scenario(request, "live");
  await unavailable.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("img", { name: "Simulated live view of Saturn" }),
  ).toBeVisible();
  await context.close();
});

for (const [name, en, ka] of [
  ["none", "Nothing is live right now", "ახლა პირდაპირ არაფერი მიდის"],
  ["offline", "The observatory is offline", "ობსერვატორია კავშირგარეშეა"],
  ["hold", "Observing is on a weather hold", "დაკვირვება ამინდის გამო შეჩერებულია"],
] as const) {
  test(`nothing to watch: ${name}, in both languages`, async ({ browser, request }) => {
    await scenario(request, name);
    const { context, page } = await stranger(browser);
    for (const [locale, title, book] of [
      ["en", en, "Book your own night"],
      ["ka", ka, "დაჯავშნე სეანსი"],
    ] as const) {
      await page.goto(`/${locale}/tonight`, { timeout: firstCompile });
      await expect(page.locator(`[data-tonight="${name}"]`)).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
      await expect(page.getByRole("link", { name: book })).toHaveAttribute(
        "href",
        `/${locale}/app/book`,
      );
      await expect(page.locator("[data-tonight-stream]")).toHaveCount(0);
    }
    await context.close();
  });
}

test("the home page points to a live session, and says nothing when there is none", async ({
  browser,
  request,
}) => {
  const { context, page } = await stranger(browser);
  await page.goto("/en", { timeout: firstCompile });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-tonight-banner]")).toHaveCount(0);

  await scenario(request, "live");
  for (const [locale, line, watch] of [
    ["en", "Live now: Saturn", "Watch"],
    ["ka", "ახლა პირდაპირ: სატურნი", "ყურება"],
  ] as const) {
    await page.goto(`/${locale}`, { timeout: firstCompile });
    const banner = page.locator("[data-tonight-banner]");
    await expect(banner).toContainText(line);
    await expect(banner.locator(".capture-simulated")).toBeVisible();
    await banner.getByRole("link", { name: watch }).click();
    await expect(page).toHaveURL(`/${locale}/tonight`);
  }
  await context.close();
});

test("the owner opens the session to Tonight, live, and closes it again", async ({
  page,
}) => {
  await page.goto(`/en/app/missions/${observing}/session`, { timeout: firstCompile });
  const panel = page.getByRole("region", { name: "Tonight, live" });
  await expect(panel).toContainText("Only you and your observers see this session.");

  const opened = page.waitForRequest((sent) =>
    sent.url().endsWith(`/api/missions/${observing}/broadcast`),
  );
  await panel.getByRole("button", { name: "Show on Tonight, live" }).click();
  const sent = await opened;
  expect(sent.method()).toBe("PATCH");
  expect(sent.postDataJSON()).toEqual({ broadcast: true });
  await expect(panel).toContainText("Anyone can watch this session on Tonight, live");

  await panel.getByRole("button", { name: "Stop showing" }).click();
  await expect(panel).toContainText("Only you and your observers see this session.");
  await expect(
    panel.getByRole("button", { name: "Show on Tonight, live" }),
  ).toBeVisible();
});

test("the owner's switch in Georgian, and a refusal said plainly", async ({ page }) => {
  await page.route(`**/api/missions/${observing}/broadcast`, (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ code: "INTERNAL", message: "Simulated failure." }),
    }),
  );
  await page.goto(`/ka/app/missions/${observing}/session`, { timeout: firstCompile });
  const panel = page.getByRole("region", { name: "ამაღამ, პირდაპირ" });
  await panel.getByRole("button", { name: "გამოჩენა „ამაღამ, პირდაპირ“-ზე" }).click();
  await expect(panel.getByRole("alert")).toHaveText("ვერ შეინახა. სცადე თავიდან.");
  await expect(panel).toContainText(
    "ამ სეანსს მხოლოდ შენ და შენი დამკვირვებლები ხედავთ.",
  );
});
