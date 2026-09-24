import { expect, test } from "@playwright/test";
import { appSidebar, bottomNavigation, liveViewport } from "./selectors";

test("communicates real telescope access in the English hero", async ({ page }) => {
  await page.goto("/en");

  await expect(
    page.getByRole("heading", { name: "Explore the real universe." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Connect to real observatories, launch astronomical missions, and capture your own images of the night sky.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Stellar by Astroman").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Start a Mission" })).toHaveAttribute(
    "href",
    "#tonight",
  );
  await expect(page.getByText("Demonstration data").first()).toBeVisible();
});

test("renders Georgian content and switches locale", async ({ page }) => {
  await page.goto("/ka");

  await expect(
    page.getByRole("heading", { name: "აღმოაჩინეთ რეალური სამყარო." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "ენა: English" }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("renders the complete data-driven public homepage", async ({ page }) => {
  await page.goto("/en");

  const sectionHeadings = [
    "A real observatory, in motion.",
    "Choose what the telescope sees next.",
    "Three steps. One real observation.",
    "Software connected to physical optics.",
    "A visual record of where you looked.",
    "One active node. Built to grow carefully.",
    "A longer window for your own sky plan.",
    "Your next observation starts here.",
  ];

  for (const heading of sectionHeadings) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  for (const target of ["Moon", "Saturn", "M31 Andromeda", "M13", "M27", "M57"]) {
    await expect(page.getByRole("heading", { name: target, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "Choose", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observe", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keep", exact: true })).toBeVisible();
  await expect(page.getByText("30 min", { exact: true })).toBeVisible();
  await expect(page.getByText("60 min", { exact: true })).toBeVisible();
  await expect(page.getByText("120 min", { exact: true })).toBeVisible();
});

test("keeps the public homepage within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  await expect(page.getByRole("link", { name: "Start a Mission" })).toBeVisible();
});

test("provides the complete public navigation on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/en");

  const header = page.getByRole("banner");
  const publicNavigation = header.getByRole("navigation", {
    name: "Public navigation",
  });

  for (const item of ["Explore", "Live", "Observatory", "Pricing", "About"]) {
    await expect(publicNavigation.getByRole("link", { name: item })).toBeVisible();
  }

  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Start Exploring" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  await expect(
    header.getByRole("navigation", { name: "Public navigation" }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("uses a desktop sidebar and native-style mobile app navigation", async ({
  page,
}) => {
  await page.goto("/en/app");

  const sidebar = appSidebar(page);
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByLabel("Stellar by Astroman")).toBeVisible();
  await expect(sidebar.getByText("Tbilisi Observatory")).toBeVisible();
  await expect(sidebar.getByText("Simulated status")).toBeVisible();

  for (const item of ["Home", "Missions", "Live", "Collection", "Profile"]) {
    await expect(sidebar.getByRole("link", { name: item })).toBeVisible();
  }

  await expect(sidebar.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const bottomNav = bottomNavigation(page);
  await expect(sidebar).toBeHidden();
  await expect(bottomNav).toBeVisible();
  await expect(page.getByRole("banner").getByText("Online")).toBeVisible();
  const mobileMissionsLink = bottomNav.getByRole("link", { name: "Missions" });
  await expect(mobileMissionsLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/en\/app\/missions$/),
    mobileMissionsLink.click(),
  ]);
  await expect(bottomNav.getByRole("link", { name: "Missions" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("shows and operates the internal visual system", async ({ page }) => {
  await page.goto("/design-system");

  await expect(page).toHaveURL(/\/en\/design-system$/);
  await expect(page.getByRole("heading", { name: "Visual system" })).toBeVisible();
  await expect(page.getByText("Weather hold", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Processing")).toBeVisible();

  await page.getByRole("button", { name: "Open modal" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm observation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).not.toBeVisible();

  await page.getByRole("tab", { name: "Visibility" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Altitude");
});

test("keeps the visual system within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/design-system");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  await page.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByRole("dialog", { name: "Observation settings" })).toBeVisible();
});

test("ranks and filters tonight's mission targets", async ({ page }) => {
  await page.goto("/en/app/missions");

  await expect(page.getByRole("heading", { name: "Available Tonight" })).toBeVisible();
  await expect(page.getByRole("article").first()).toContainText("Saturn");

  await page.getByRole("button", { name: "Galaxies" }).click();
  await expect(page.getByRole("heading", { name: "Andromeda Galaxy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saturn" })).toBeHidden();
});

test("shows the consumer mission detail before technical data", async ({ page }) => {
  await page.goto("/en/app/missions/saturn");

  await expect(page.getByRole("heading", { name: "Saturn", exact: true })).toBeVisible();
  await expect(page.getByText("Clear observing window")).toBeVisible();
  await expect(page.getByText("Stellar Tbilisi Observatory")).toBeVisible();
  await expect(page.getByText("23h 12m 41s / −06° 42′ 18″")).toBeHidden();

  await page.getByText("Advanced technical information").click();
  await expect(page.getByText("23h 12m 41s / −06° 42′ 18″")).toBeVisible();

  const startMission = page.getByRole("link", { name: "Start Mission" });
  await expect(startMission).toHaveAttribute(
    "href",
    "/en/app/missions/DV-SIM-001/session",
  );
  await startMission.click();
  await expect(page).toHaveURL(/\/en\/app\/missions\/DV-SIM-001\/session$/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "Preparing your observation" }),
  ).toBeVisible();
});

test("keeps missions usable inside a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/missions");

  await expect(
    page.getByRole("heading", { name: "დღეს დაკვირვებისთვის ხელმისაწვდომია" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "ობიექტის ნახვა" }).first().click();
  await expect(page.getByRole("link", { name: "დაიწყე მისია" })).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("runs a visibly simulated mission through data-driven states", async ({ page }) => {
  await page.goto("/en/app/missions/DV-SIM-001/session");

  await expect(page.getByText("SIMULATED OBSERVATORY").first()).toBeVisible();
  await expect(page.getByText(/no commands are sent to hardware/)).toBeVisible();
  await expect(page.getByText("Saturn visible")).toBeVisible();

  await page.getByRole("button", { name: "Advance state" }).click();
  await expect(
    page.getByRole("heading", { name: "Moving telescope to Saturn" }),
  ).toBeVisible();
  await expect(page.getByText("Telescope slew started")).toBeVisible();

  await page.getByLabel("Test a failure state").selectOption("WEATHER_HOLD");
  await expect(page.getByRole("heading", { name: "Weather hold" })).toBeVisible();
  await expect(page.getByText("Mission placed on weather hold")).toBeVisible();
});

test("keeps the mission session within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/missions/DV-SIM-001/session");

  await expect(page.getByText("SIMULATED OBSERVATORY").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "თქვენი დაკვირვება მზადდება" }),
  ).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("operates the live capture instrument without mount controls", async ({ page }) => {
  await page.goto("/en/app/live");

  await expect(page.getByText("STELLAR LIVE")).toBeVisible();
  await expect(liveViewport(page).getByText("Tbilisi Observatory")).toBeVisible();
  await expect(page.getByText("Observer · Public mission")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();

  const brightPreset = page
    .getByRole("group", { name: "Image processing preset" })
    .getByRole("button", { name: /Bright/ });
  await brightPreset.click();
  await expect(brightPreset).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Capture/ }).click();
  await expect(page.getByText("Collecting light").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Capture/ })).toBeDisabled();

  await expect(page.getByText("Safe Nudge")).toHaveCount(0);
  await expect(page.getByText(/mount/i)).toHaveCount(0);
});

test("prioritizes the live viewport on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/live");

  const viewport = liveViewport(page);
  await expect(viewport).toBeVisible();
  await expect(page.getByText("STELLAR LIVE")).toBeVisible();
  expect((await viewport.boundingBox())?.height).toBeGreaterThanOrEqual(540);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});

test("presents captures as a personal astronomy collection", async ({ page }) => {
  await page.goto("/en/app/collection");

  await expect(
    page.getByRole("heading", { name: "A sky only you have seen." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saturn" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Solar System" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Messier Starter" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deep Sky" })).toBeVisible();
  await expect(page.getByText("2 / 4 observed")).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole("img", { name: "Saturn observation" })
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);

  await page.getByRole("link", { name: "Open capture", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/app\/collection\/CAP-DV-0001$/);
  await expect(page.getByText("Captured by you")).toBeVisible();
});

test("operates capture download, sharing, privacy, and mission actions", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/app/collection/CAP-DV-0001");

  await expect(page.getByRole("link", { name: "Download" })).toHaveAttribute(
    "download",
    "CAP-DV-0001.svg",
  );
  await expect(page.getByRole("link", { name: "View mission" })).toHaveAttribute(
    "href",
    "/en/app/missions/DV-SIM-001/session",
  );

  await page.getByRole("button", { name: "Share link" }).click();
  await expect(page.getByText("Share link copied")).toBeVisible();

  await page.getByRole("button", { name: "Make private" }).click();
  await expect(page.getByText("This capture is now private.")).toBeVisible();
  await expect(page.getByText("Private", { exact: true })).toBeVisible();
});

test("keeps the Georgian collection detail within a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/collection/CAP-DV-0001");

  await expect(page.getByRole("heading", { name: "სატურნი" })).toBeVisible();
  await expect(page.getByText("თქვენ მიერ გადაღებული")).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("presents a personalized authenticated home without dashboard overload", async ({
  page,
}) => {
  await page.goto("/en/app");

  await expect(
    page.getByRole("heading", { name: "Good evening, Observer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Saturn is excellent tonight" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Observe Saturn" })).toHaveAttribute(
    "href",
    "/en/app/missions/saturn",
  );
  await expect(page.getByRole("heading", { name: "Live now" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming missions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Continue exploring" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Collection progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tbilisi Observatory" })).toBeVisible();
});

test("keeps the Georgian authenticated home within a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app");

  await expect(
    page.getByRole("heading", { name: "საღამო მშვიდობისა, დამკვირვებელი" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "სატურნი დღეს შესანიშნავად ჩანს" }),
  ).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("explains the physical observatory and configurable equipment", async ({ page }) => {
  await page.goto("/en/observatory");

  await expect(
    page.getByRole("heading", { level: 1, name: "Stellar Tbilisi Observatory" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Stellar Tbilisi Observatory" })
      .getByText("Tbilisi, Georgia", {
        exact: true,
      }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Stellar operates a physical telescope system remotely through secure observatory software.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observatory status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "NexStar 6SE" })).toBeVisible();
  await expect(page.getByText("Expected MVP configuration")).toBeVisible();
  await expect(page.getByText("Demonstration status")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Safety comes before movement" }),
  ).toBeVisible();
  await expect(page.getByText("Sun avoidance")).toBeVisible();
  await expect(
    page.getByText("No future observatory partners are being represented."),
  ).toBeVisible();
});

test("preserves observatory locale and mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/observatory");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "სტელარის თბილისის ობსერვატორია",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ნავიგაციის გახსნა" }).click();
  await expect(page.getByRole("link", { name: "ენა: English" })).toHaveAttribute(
    "href",
    "/en/observatory",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("shows configured offerings without invented prices or checkout", async ({
  page,
}) => {
  await page.goto("/en/pricing");

  await expect(
    page.getByRole("heading", { name: "Choose how deeply you look." }),
  ).toBeVisible();
  for (const offering of ["Observer", "Explorer", "Advanced", "Private Observatory"]) {
    await expect(page.getByRole("heading", { name: offering })).toBeVisible();
  }

  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Price to be confirmed").first()).toBeVisible();
  await expect(page.getByText("Future · feature disabled")).toBeVisible();
  await expect(page.getByText("Payments and checkout are not enabled.")).toBeVisible();
  await expect(page.getByRole("button", { name: /checkout|subscribe|buy/i })).toHaveCount(
    0,
  );

  for (const duration of ["30", "60", "120"]) {
    await expect(page.getByText(duration, { exact: true })).toBeVisible();
  }
});

test("keeps localized pricing inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/pricing");

  await expect(
    page.getByRole("heading", { name: "აირჩიეთ, რამდენად ღრმად გაიხედავთ." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ნავიგაციის გახსნა" }).click();
  await expect(page.getByRole("link", { name: "ენა: English" })).toHaveAttribute(
    "href",
    "/en/pricing",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
