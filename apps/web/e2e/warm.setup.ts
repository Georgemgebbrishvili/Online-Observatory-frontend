import { test } from "@playwright/test";

import {
  appRoutes,
  locales,
  operatorRoutes,
  publicRoutes,
  signedOutRoutes,
} from "./routes";

/**
 * `next dev` compiles a route the first time it is requested. With the suite running
 * in parallel, forty route/locale combinations competing to compile made unrelated
 * tests time out — home.spec.ts:76 and :103 first, then whichever test drew the short
 * straw. Nothing was wrong with those pages: they passed alone, every time.
 *
 * So compile everything once, serially, before the parallel run starts. This costs a
 * minute and buys a suite whose failures mean something. It also keeps `next dev`,
 * rather than forcing a production build before every local e2e run.
 */
test("warm every route so the parallel run is not racing the compiler", async ({
  page,
}) => {
  test.setTimeout(10 * 60 * 1000);

  const routes = [...publicRoutes, ...appRoutes, ...signedOutRoutes, ...operatorRoutes];

  for (const locale of locales) {
    for (const route of routes) {
      const path = `/${locale}${route ? `/${route}` : ""}`;
      // A redirect is a compiled route too; what matters is that the compiler has
      // already run by the time a timing-sensitive test asks for the page.
      await page.goto(path, { waitUntil: "commit" });
    }
  }
});
