import type { Page } from "@playwright/test";

/**
 * Handles for the few places a role or a name is not enough on its own. Tests use
 * these instead of style class names, so the visual layer can be reworked without
 * a single test needing to change.
 */

/**
 * The application bar (ADR-052 §6): the one banner on an /app page, keyed to the
 * navigation it carries so it works in both languages without a looked-up name.
 */
export function appBar(page: Page) {
  return page
    .getByRole("banner")
    .filter({ has: page.locator("nav[data-placement='bar']") });
}

/** The mobile bottom navigation. Both placements share one accessible name. */
export function bottomNavigation(page: Page) {
  return page.locator("nav[data-placement='bottom']");
}

/** The live view. `data-capture-state` is behaviour the component already exposes. */

/** One row of a dt/dd panel, named by its `data-field`. */
export function field(page: Page, name: string) {
  return page.locator(`[data-field="${name}"]`);
}
