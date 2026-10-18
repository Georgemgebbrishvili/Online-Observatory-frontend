import type { Page } from "@playwright/test";

/**
 * Handles for the few places a role or a name is not enough on its own. Tests use
 * these instead of style class names, so the visual layer can be reworked without
 * a single test needing to change.
 */

/** The Account menu in the one site header, open, as a signed-in visitor sees it. */
export async function openAccountMenu(page: Page) {
  const banner = page.getByRole("banner");
  await banner.getByRole("button", { name: /^(Account|ანგარიში)$/ }).click();
  return banner.locator("#account-menu-list");
}

/** The live view. `data-capture-state` is behaviour the component already exposes. */

/** One row of a dt/dd panel, named by its `data-field`. */
export function field(page: Page, name: string) {
  return page.locator(`[data-field="${name}"]`);
}
