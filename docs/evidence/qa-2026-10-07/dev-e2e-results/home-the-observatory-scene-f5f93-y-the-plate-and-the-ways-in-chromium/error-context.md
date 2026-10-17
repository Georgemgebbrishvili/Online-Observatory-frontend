# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> the observatory scene carries the state, tonight's sky, the plate and the ways in
- Location: e2e/home.spec.ts:403:1

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3100/en/observatory", waiting until "load"

```

# Test source

```ts
  307 |   ).toBeVisible();
  308 |   await page.getByRole("link", { name: "ობიექტის ნახვა" }).first().click();
  309 |   await expect(page.getByRole("link", { name: "დაჯავშნე დაკვირვება" })).toBeVisible();
  310 | 
  311 |   const viewport = await page.evaluate(() => ({
  312 |     clientWidth: document.documentElement.clientWidth,
  313 |     scrollWidth: document.documentElement.scrollWidth,
  314 |   }));
  315 |   expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  316 | });
  317 | 
  318 | // ADR-037: /app/live is the caller's live or imminent mission's room, or booking.
  319 | test("/app/live opens the observer's live mission room", async ({ page }) => {
  320 |   await page.goto("/en/app/live");
  321 |   // Client-side: the shared loading state streams before the page can redirect.
  322 |   await expect(page).toHaveURL(
  323 |     "/en/app/missions/20000000-0000-4000-8000-000000000001/session",
  324 |     { timeout: 15_000 },
  325 |   );
  326 |   await expect(page.locator(".live-feed")).toBeVisible();
  327 | });
  328 | 
  329 | test.describe("with no live or imminent mission", () => {
  330 |   test.use({ storageState: { cookies: [], origins: [] } });
  331 | 
  332 |   test("/app/live goes to booking, in the caller's language", async ({ page }) => {
  333 |     await page.goto("/ka/sign-in");
  334 |     await page.locator('input[type="email"]').fill("watcher@darkview.test");
  335 |     await page.locator('input[type="password"]').fill("correct horse battery");
  336 |     await page.locator('button[type="submit"]').click();
  337 |     await expect(page).toHaveURL(/\/ka\/app$/);
  338 | 
  339 |     await page.goto("/ka/app/live");
  340 |     await expect(page).toHaveURL("/ka/app/book", { timeout: 15_000 });
  341 |   });
  342 | });
  343 | 
  344 | test("the /app dashboard reads the platform, section by section", async ({ page }) => {
  345 |   await page.goto("/en/app");
  346 | 
  347 |   await expect(
  348 |     page.getByRole("heading", { name: "Welcome back, Observer." }),
  349 |   ).toBeVisible();
  350 |   // The highest observable target in the fake's fixed sky.
  351 |   await expect(
  352 |     page.getByRole("heading", { name: "Albireo is up tonight" }),
  353 |   ).toBeVisible();
  354 |   await expect(page.getByRole("link", { name: "Observe Albireo" })).toHaveAttribute(
  355 |     "href",
  356 |     "/en/app/missions/albireo",
  357 |   );
  358 |   // Albireo has no drawn plate, so the recommendation shows no picture at all.
  359 |   await expect(page.locator(".home-illustration")).toHaveCount(0);
  360 | 
  361 |   const observatory = page.locator(".home-observatory");
  362 |   await expect(
  363 |     observatory.getByRole("heading", { name: "Stellar Tbilisi" }),
  364 |   ).toBeVisible();
  365 |   await expect(observatory.getByText("Simulated observatory")).toBeVisible();
  366 |   await expect(
  367 |     observatory.getByText("Celestron NexStar 6SE · 150 mm · 1500 mm"),
  368 |   ).toBeVisible();
  369 | 
  370 |   const upcoming = page.locator(".home-upcoming");
  371 |   await expect(upcoming.getByRole("heading", { name: "Saturn" })).toBeVisible();
  372 |   await expect(upcoming.getByText("15 January 2030")).toBeVisible();
  373 |   await expect(upcoming.getByText("Simulated")).toBeVisible();
  374 | 
  375 |   await expect(page.getByRole("heading", { name: "Also up tonight" })).toBeVisible();
  376 |   await expect(page.locator(".home-recent-captures a")).toHaveCount(2);
  377 |   await expect(page.locator(".home-capture-simulated")).toHaveCount(2);
  378 | 
  379 |   // Nothing the platform cannot back.
  380 |   await expect(page.getByRole("heading", { name: "Live now" })).toBeHidden();
  381 |   await expect(page.getByText("41.72")).toBeHidden();
  382 |   await expect(page.getByText(/excellent/i)).toBeHidden();
  383 | });
  384 | 
  385 | test("keeps the Georgian authenticated home within a mobile viewport", async ({
  386 |   page,
  387 | }) => {
  388 |   await page.setViewportSize({ width: 390, height: 844 });
  389 |   await page.goto("/ka/app");
  390 | 
  391 |   await expect(
  392 |     page.getByRole("heading", { name: "კეთილი იყოს შენი დაბრუნება, Observer." }),
  393 |   ).toBeVisible();
  394 |   await expect(page.getByRole("heading", { name: "ალბირეო ამაღამ ჩანს" })).toBeVisible();
  395 | 
  396 |   const viewport = await page.evaluate(() => ({
  397 |     clientWidth: document.documentElement.clientWidth,
  398 |     scrollWidth: document.documentElement.scrollWidth,
  399 |   }));
  400 |   expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  401 | });
  402 | 
  403 | test("the observatory scene carries the state, tonight's sky, the plate and the ways in", async ({
  404 |   page,
  405 | }) => {
  406 |   await page.setViewportSize({ width: 1440, height: 900 });
> 407 |   await page.goto("/en/observatory");
      |              ^ Error: page.goto: Target page, context or browser has been closed
  408 | 
  409 |   await expect(
  410 |     page.getByRole("heading", { level: 1, name: "Stellar Tbilisi" }),
  411 |   ).toBeVisible();
  412 | 
  413 |   const scene = page.locator(".observatory-live");
  414 |   await expect(scene.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  415 |   // The fake starts with a mission observing, and the operator's cancel test ends it;
  416 |   // which one this test sees depends on the order the workers run in.
  417 |   await expect(scene.locator(".observatory-pill")).toHaveText(/^(Online|Observing)$/);
  418 |   await expect(scene.getByText("Celestron NexStar 6SE")).toBeVisible();
  419 |   // The fake's first forecast hour: 12% cloud, at 20:00Z, read in Tbilisi.
  420 |   await expect(scene.getByText("12% cloud")).toBeVisible();
  421 |   await expect(scene.getByText("00:00", { exact: true })).toBeVisible();
  422 | 
  423 |   const book = scene.getByRole("link", { name: "Book a slot" });
  424 |   const watch = scene.getByRole("link", { name: "Watch live" });
  425 |   await expect(book).toHaveAttribute("href", "/en/app/book");
  426 |   await expect(watch).toHaveAttribute("href", "/en/app/live");
  427 | 
  428 |   const plate = page.getByRole("figure", {
  429 |     name: "The camera's frame drawn over the Moon, to scale",
  430 |   });
  431 |   await expect(plate.getByText("Illustration — not telescope output")).toBeVisible();
  432 | 
  433 |   const dock = page.getByRole("navigation", { name: "Ways in" });
  434 |   await expect(dock.getByRole("link")).toHaveCount(4);
  435 | 
  436 |   // The scene is the first screen.
  437 |   for (const locator of [scene, book, watch, plate, dock]) {
  438 |     const box = await locator.boundingBox();
  439 |     expect(box && box.y + box.height).toBeLessThanOrEqual(900);
  440 |   }
  441 | 
  442 |   const tonight = page.locator(".observatory-tonight");
  443 |   await expect(tonight.getByRole("link", { name: /Albireo/ })).toHaveAttribute(
  444 |     "href",
  445 |     "/en/app/missions/albireo",
  446 |   );
  447 |   const instrument = page.locator(".observatory-instrument");
  448 |   await expect(instrument.getByText("ZWO ASI585MC")).toBeVisible();
  449 |   await expect(instrument.getByText("25.5′ × 14.4′")).toBeVisible();
  450 | 
  451 |   // Claims the platform does not back are gone.
  452 |   await expect(page.getByText(/41\.72/)).toHaveCount(0);
  453 |   await expect(page.getByText(/\b(cooled|cooling)\b/i)).toHaveCount(0);
  454 |   await expect(page.getByText("Demonstration status")).toHaveCount(0);
  455 |   const jsonLd = await page
  456 |     .locator('script[type="application/ld+json"]')
  457 |     .allTextContents();
  458 |   expect(jsonLd.join("")).not.toContain("GeoCoordinates");
  459 | 
  460 |   await expect(
  461 |     page.getByRole("heading", { name: "Nothing moves until it is allowed to." }),
  462 |   ).toBeVisible();
  463 | });
  464 | 
  465 | test("/network is folded into the observatory page", async ({ page }) => {
  466 |   const response = await page.request.get("/en/network", { maxRedirects: 0 });
  467 |   expect(response.status()).toBe(308);
  468 |   expect(response.headers().location).toMatch(/\/en\/observatory#network$/);
  469 | 
  470 |   await page.goto("/ka/network");
  471 |   await expect(page).toHaveURL(/\/ka\/observatory#network$/);
  472 |   await expect(page.locator("#network")).toContainText("დღეს — ერთი ადგილი.");
  473 | });
  474 | test("preserves observatory locale and mobile width", async ({ page }) => {
  475 |   await page.setViewportSize({ width: 390, height: 844 });
  476 |   await page.goto("/ka/observatory");
  477 | 
  478 |   await expect(
  479 |     page.getByRole("heading", {
  480 |       level: 1,
  481 |       // The platform's name for the observatory (BookableObservatory.nameKa).
  482 |       name: "სტელარი თბილისი",
  483 |     }),
  484 |   ).toBeVisible();
  485 |   await page.getByRole("button", { name: "ნავიგაციის გახსნა" }).click();
  486 |   await expect(page.getByRole("link", { name: "ენა: English" })).toHaveAttribute(
  487 |     "href",
  488 |     "/en/observatory",
  489 |   );
  490 | 
  491 |   const viewport = await page.evaluate(() => ({
  492 |     clientWidth: document.documentElement.clientWidth,
  493 |     scrollWidth: document.documentElement.scrollWidth,
  494 |   }));
  495 |   expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  496 | });
  497 | 
  498 | test("shows what exists today, without invented prices or concept tiers", async ({
  499 |   page,
  500 | }) => {
  501 |   await page.goto("/en/pricing");
  502 | 
  503 |   await expect(
  504 |     page.getByRole("heading", { level: 1, name: "What it costs today." }),
  505 |   ).toBeVisible();
  506 |   for (const offering of ["Browse", "A seat in a live session", "An observation slot"]) {
  507 |     await expect(page.getByRole("heading", { name: offering })).toBeVisible();
```