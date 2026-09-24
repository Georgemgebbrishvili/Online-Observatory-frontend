import type { Page } from "@playwright/test";

/**
 * Handles for the few places a role or a name is not enough on its own. Tests use
 * these instead of style class names, so the visual layer can be reworked without
 * a single test needing to change.
 */

/**
 * The application sidebar. The page carries two `complementary` landmarks -- this
 * one and the observatory panel -- and both are now named, so either would resolve
 * by name. It stays keyed to the navigation it contains because that works in both
 * languages, where a name would have to be looked up per locale.
 */
export function appSidebar(page: Page) {
  return page
    .getByRole("complementary")
    .filter({ has: page.locator("nav[data-placement='sidebar']") });
}

/** The mobile bottom navigation. Both placements share one accessible name. */
export function bottomNavigation(page: Page) {
  return page.locator("nav[data-placement='bottom']");
}

/** The live view. `data-capture-state` is behaviour the component already exposes. */
export function liveViewport(page: Page) {
  return page.locator("[data-capture-state]");
}

/** One row of a dt/dd panel, named by its `data-field`. */
export function field(page: Page, name: string) {
  return page.locator(`[data-field="${name}"]`);
}
