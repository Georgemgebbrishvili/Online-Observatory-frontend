import { expect, test, type Browser } from "@playwright/test";

// ADR-065, against e2e/fake-platform.mjs: sharer@ owns two REAL captures of Saturn,
// 60…04 shared from the start and 60…05 private until this spec shares it. The observer's
// own captures are simulated and never shareable.
const shared = "60000000-0000-4000-8000-000000000004";
const unshared = "60000000-0000-4000-8000-000000000005";
const simulated = "60000000-0000-4000-8000-000000000001";
const firstCompile = 90_000;

test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

async function stranger(browser: Browser) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  return { context, page: await context.newPage() };
}

test("a stranger opens a shared capture: the sky and the facts, never the person", async ({
  browser,
}) => {
  const { context, page } = await stranger(browser);
  const response = await page.goto(`/en/c/${shared}`, { timeout: firstCompile });
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Saturn, captured live through the telescope" }),
  ).toBeVisible();
  await expect(page.getByText("203 mm aperture · 2032 mm focal length")).toBeVisible();
  await expect(page.getByText("60 frames")).toBeVisible();
  await expect(page.getByRole("link", { name: "Book your own night" })).toHaveAttribute(
    "href",
    "/en/app/book",
  );
  for (const absent of ["Sharer", "sharer@darkview.test", "Celestron", "NexStar"]) {
    await expect(page.getByText(absent)).toHaveCount(0);
  }
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("noindex");
  await context.close();
});

test("the same capture in Georgian", async ({ browser }) => {
  const { context, page } = await stranger(browser);
  await page.goto(`/ka/c/${shared}`, { timeout: firstCompile });
  await expect(page.getByRole("heading", { level: 1, name: "სატურნი" })).toBeVisible();
  await expect(page.getByText("საქართველო", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "დაჯავშნე სეანსი" })).toBeVisible();
  await context.close();
});

test("private, simulated and unknown are all a plain 404", async ({ browser }) => {
  const { context, page } = await stranger(browser);
  for (const id of [unshared, simulated, "60000000-0000-4000-8000-000000000999"]) {
    const response = await page.goto(`/en/c/${id}`, { timeout: firstCompile });
    expect(response?.status(), id).toBe(404);
  }
  await context.close();
});

test("the link unfurls into a picture in both languages", async ({ request }) => {
  for (const locale of ["en", "ka"]) {
    const response = await request.get(`/${locale}/c/${shared}/opengraph-image`, {
      timeout: firstCompile,
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect((await response.body()).byteLength).toBeGreaterThan(10_000);
  }
});

test("the owner shares a capture, the link works, and taking it back ends it", async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto("/en/sign-in", { timeout: firstCompile });
  await page.getByLabel("Email").fill("sharer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  await page.goto(`/en/app/collection/${unshared}`, { timeout: firstCompile });
  const sharing = page.getByRole("region", { name: "Share" });
  await expect(sharing.getByText("Only you can see this capture.")).toBeVisible();
  await sharing.getByRole("button", { name: "Make public" }).click();
  await expect(
    sharing.getByText(/Anyone with the link can see this capture/),
  ).toBeVisible();
  await expect(sharing.getByRole("link", { name: `/en/c/${unshared}` })).toBeVisible();

  const { context: other, page: outsider } = await stranger(browser);
  expect((await outsider.goto(`/en/c/${unshared}`))?.status()).toBe(200);

  await sharing.getByRole("button", { name: "Make private" }).click();
  await expect(sharing.getByText("Only you can see this capture.")).toBeVisible();
  expect((await outsider.goto(`/en/c/${unshared}`))?.status()).toBe(404);

  await other.close();
  await context.close();
});

test("a simulated capture says why it cannot be shared", async ({ page }) => {
  await page.goto(`/en/app/collection/${simulated}`, { timeout: firstCompile });
  const sharing = page.getByRole("region", { name: "Share" });
  await expect(
    sharing.getByText(
      "Simulated captures cannot be shared — they are not telescope output.",
    ),
  ).toBeVisible();
  await expect(sharing.getByRole("button")).toHaveCount(0);
});
