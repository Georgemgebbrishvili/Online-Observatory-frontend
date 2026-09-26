import { expect, test, type Page } from "@playwright/test";

// Phase 2 slice 2, against e2e/fake-platform.mjs: three simulated M13 captures, paged
// two at a time. The first has every asset, the second no FITS, the third no images.
const first = "60000000-0000-4000-8000-000000000001";
const third = "60000000-0000-4000-8000-000000000003";

/** Fails the test on any CSP refusal: a signed image the policy blocks is a broken image. */
function refusals(page: Page) {
  const seen: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text())) seen.push(message.text());
  });
  return seen;
}

async function decoded(page: Page, name: string) {
  await expect
    .poll(() =>
      page
        .getByRole("img", { name })
        .first()
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
}

test("the Collection lists the platform's captures, newest first, and pages", async ({
  page,
}) => {
  const blocked = refusals(page);
  await page.goto("/en/app/collection");

  await expect(
    page.getByRole("heading", { name: "A sky only you have seen." }),
  ).toBeVisible();
  const featured = page.locator(".featured-capture");
  await expect(featured.getByRole("heading", { name: "Hercules Cluster" })).toBeVisible();
  await expect(featured.getByText("Simulated capture")).toBeVisible();
  await expect(featured.getByText("23 September 2026")).toBeVisible();
  await decoded(page, "Hercules Cluster, as captured");

  // Nothing the platform cannot back.
  await expect(page.getByRole("heading", { name: "Solar System" })).toBeHidden();
  await expect(page.getByText("Processing")).toBeHidden();

  await expect(page.locator(".capture-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Older captures" }).click();
  await expect(page).toHaveURL(/\?cursor=60000000-0000-4000-8000-000000000002$/);
  await expect(page.locator(".featured-capture")).toHaveCount(0);
  const card = page.locator(".capture-card");
  await expect(card).toHaveCount(1);
  await expect(card.getByText("No preview for this capture")).toBeVisible();
  await expect(page.getByRole("link", { name: "Older captures" })).toBeHidden();

  await page.getByRole("link", { name: "Back to the newest" }).click();
  await expect(page).toHaveURL(/\/en\/app\/collection$/);
  expect(blocked).toEqual([]);
});

test("a cursor past the end says so, and a malformed one starts at the newest", async ({
  page,
}) => {
  await page.goto(`/en/app/collection?cursor=${third}`);
  await expect(page.getByRole("heading", { name: "No older captures." })).toBeVisible();

  await page.goto("/en/app/collection?cursor=CAP-DV-0001");
  await expect(page.locator(".featured-capture")).toHaveCount(1);
});

test("a capture shows its provenance and mints downloads on the click", async ({
  page,
}) => {
  const blocked = refusals(page);
  await page.goto(`/en/app/collection/${first}`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Hercules Cluster" }),
  ).toBeVisible();
  await expect(page.getByText("Stellar Tbilisi")).toBeVisible();
  await expect(page.getByText("Simulator, not the telescope")).toBeVisible();
  await expect(page.getByText("945 mm · f/6.3, with reducer")).toBeVisible();
  await expect(page.getByText("948 mm")).toBeVisible();
  await expect(page.getByText("3840 × 2160 px")).toBeVisible();
  await decoded(page, "Hercules Cluster, as captured");
  await expect(page.getByRole("button", { name: /make public|share/i })).toHaveCount(0);

  const minted = page.waitForRequest((request) =>
    request.url().endsWith(`/api/captures/${first}/download?kind=IMAGE`),
  );
  await page.getByRole("button", { name: "Download image" }).click();
  await minted;
  await page.waitForURL(
    `http://127.0.0.1:4110/storage/${first}/image?X-Amz-Signature=fake`,
  );
  expect(blocked).toEqual([]);
});

test("a capture with no images and no FITS says so", async ({ page }) => {
  await page.goto(`/en/app/collection/${third}`);
  await expect(page.getByText("No preview for this capture")).toBeVisible();
  await expect(page.getByText("FITS was not recorded for this capture")).toBeVisible();
  await expect(page.getByRole("button", { name: "Download FITS" })).toHaveCount(0);
});

// The not-found page, not the status: [locale]/loading.tsx streams a 200 before the
// page can call notFound(), so every dynamic page here is a soft 404 with noindex.
test("an unknown capture and a malformed id are both not found", async ({ page }) => {
  for (const id of ["60000000-0000-4000-8000-000000000009", "CAP-DV-0001"]) {
    await page.goto(`/en/app/collection/${id}`);
    await expect(
      page.getByRole("heading", { name: "Observation not found" }),
    ).toBeVisible();
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]').first(),
    ).toBeAttached();
  }
});

test("the Georgian capture page fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/ka/app/collection/${first}`);

  await expect(
    page.getByRole("heading", { level: 1, name: "ჰერკულესის გროვა" }),
  ).toBeVisible();
  await expect(page.getByText("სიმულირებული კადრი")).toBeVisible();
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
