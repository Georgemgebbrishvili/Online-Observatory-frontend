import { expect, test, type Page } from "@playwright/test";

// Phase 4 slice 5, against e2e/fake-platform.mjs: Nino's session open to watchers, a
// second one with every seat sold, and the observer's own session, which nobody opened.
// Buying a seat changes the fake for the session that bought it, so a buyer signs in on
// a session of its own and parallel tests never share a seat.
const open = "23000000-0000-4000-8000-000000000004";
const full = "24000000-0000-4000-8000-000000000005";
const observing = "20000000-0000-4000-8000-000000000001";

async function signIn(page: Page, email: string) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/);
}

async function scenario(page: Page, value: string) {
  await page
    .context()
    .addCookies([{ name: "fake_watch", value, url: "http://localhost:3100" }]);
}

async function payAtCheckout(page: Page, locale: "en" | "ka", buy: string) {
  await page.getByRole("button", { name: buy }).click();
  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  await page.getByRole("button", { name: "Pay" }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/app/missions/${open}/watch$`));
}

test.describe("a watcher", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("buys a seat, watches the simulated session, and leaves", async ({ page }) => {
    await signIn(page, "observer@darkview.test");
    await page.goto(`/en/app/missions/${open}/watch`);

    await expect(
      page.getByRole("heading", { level: 1, name: "Nino is observing Saturn." }),
    ).toBeVisible();
    await expect(page.getByText("2 of 5 seats taken.")).toBeVisible();
    await expect(
      page.getByRole("note").filter({ hasText: "Simulated observatory" }),
    ).toBeVisible();

    await payAtCheckout(page, "en", "Buy a seat");
    await expect(
      page.getByText("You are watching. You cannot move the telescope or keep captures."),
    ).toBeVisible();
    await expect(page.getByText("3 of 5 seats taken.")).toBeVisible();
    await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
    await expect(page.locator(".live-feed-badge")).toHaveText("Simulated");
    // View only: nothing that moves the telescope or keeps a capture.
    await expect(
      page.getByRole("button", { name: /Capture|^Stop$|Re-centre/ }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Stop watching" }).click();
    await expect(
      page.getByText("You left. Your seat stays yours until the session ends."),
    ).toBeVisible();
    await expect(page.locator(".live-feed")).toHaveCount(0);

    // The seat is still theirs: watching again needs no checkout.
    await page.getByRole("button", { name: "Watch again" }).click();
    await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
  });

  test("waits for a payment that settles late, then watches", async ({ page }) => {
    await signIn(page, "observer@darkview.test");
    await scenario(page, "settling");
    await page.goto(`/en/app/missions/${open}/watch`);

    await payAtCheckout(page, "en", "Buy a seat");
    await expect(page.getByText("Waiting for your payment to settle")).toBeVisible();
    await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live", {
      timeout: 10_000,
    });
  });

  test("is told when the owner closes the session", async ({ page }) => {
    await signIn(page, "observer@darkview.test");
    await scenario(page, "closed");
    await page.goto(`/en/app/missions/${open}/watch`);

    await payAtCheckout(page, "en", "Buy a seat");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The owner closed this session to watchers.",
      }),
    ).toBeVisible();
    await expect(page.locator(".live-feed")).toHaveCount(0);
  });

  test("finds every seat taken", async ({ page }) => {
    await signIn(page, "observer@darkview.test");
    await page.goto(`/en/app/missions/${full}/watch`);
    await expect(page.getByText("5 of 5 seats taken.")).toBeVisible();
    await expect(page.getByText("Every seat is taken.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buy a seat" })).toHaveCount(0);
  });

  test("is told a session nobody opened is not open to watch", async ({ page }) => {
    await signIn(page, "watcher@darkview.test");
    await page.goto(`/en/app/missions/${observing}/watch`);
    await expect(
      page.getByRole("heading", { level: 1, name: "This session is not open to watch." }),
    ).toBeVisible();
  });

  test("buys and watches in Georgian, returned to the Georgian page", async ({
    page,
  }) => {
    await signIn(page, "watcher@darkview.test");
    await page.goto(`/ka/app/missions/${open}/watch`);

    await expect(
      page.getByRole("heading", { level: 1, name: "Nino აკვირდება: სატურნი." }),
    ).toBeVisible();
    await expect(page.getByText("დაკავებულია 2 ადგილი 5-დან.")).toBeVisible();

    await payAtCheckout(page, "ka", "ადგილის ყიდვა");
    await expect(
      page.getByText("შენ უყურებ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია."),
    ).toBeVisible();
    await expect(page.locator(".live-feed-badge")).toHaveText("სიმულირებული");

    await page.getByRole("button", { name: "ყურების შეწყვეტა" }).click();
    await expect(page.getByRole("button", { name: "ხელახლა ყურება" })).toBeVisible();
  });

  test("the Georgian watch page fits a phone", async ({ page }) => {
    await signIn(page, "watcher@darkview.test");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/ka/app/missions/${open}/watch`);
    await expect(page.getByRole("button", { name: "ადგილის ყიდვა" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
});

test("the owner is sent to the live room", async ({ page }) => {
  await page.goto(`/en/app/missions/${observing}/watch`);
  await expect(
    page.getByRole("heading", { level: 1, name: "This is your session." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to the live room" })).toHaveAttribute(
    "href",
    `/en/app/missions/${observing}/session`,
  );
});

test("the Georgian owner is sent to the live room", async ({ page }) => {
  await page.goto(`/ka/app/missions/${observing}/watch`);
  await expect(
    page.getByRole("heading", { level: 1, name: "ეს შენი სესიაა." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "პირდაპირი დაკვირვების ოთახში გადასვლა" }),
  ).toBeVisible();
});
