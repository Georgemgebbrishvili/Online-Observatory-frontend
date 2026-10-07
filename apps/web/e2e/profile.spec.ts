import { createHash } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

// Account slice 2 (docs/plan/account/02-profile.md), against e2e/fake-platform.mjs. One
// account of its own, whose name, password and address these tests change in order.
const firstCompile = 90_000;
test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

const start = "profiled@darkview.test";
const moved = `profiled-${Date.now()}@darkview.test`;
let secret = "correct horse battery";

// The fake derives a change link from the new address, as it does a reset link.
const changeLink = (locale: string, email: string) =>
  `/${locale}/verify-email/${createHash("sha256")
    .update(`email-change:${email}`)
    .digest("base64url")}`;

async function signIn(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
}

const panel = (page: Page, name: string) => page.getByRole("region", { name });

test("saves a name and the language emails come in", async ({ page }) => {
  await signIn(page, start);
  await page.goto("/en/app/profile");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your profile.");

  const details = panel(page, "Details");
  await details.getByLabel("Name").fill("Nino Profiled");
  await details.getByLabel("Language for emails").selectOption("ka");
  await details.getByRole("button", { name: "Save" }).click();
  await expect(details.getByRole("status")).toHaveText("Saved.");

  await page.reload();
  await expect(panel(page, "Details").getByLabel("Name")).toHaveValue("Nino Profiled");
  await expect(panel(page, "Details").getByLabel("Language for emails")).toHaveValue("ka");
});

test("names a wrong current password, and keeps it out of the page", async ({ page }) => {
  await signIn(page, start);
  await page.goto("/en/app/profile");

  const password = panel(page, "Password");
  await password.getByLabel("Current password").fill("not my password at all");
  await password.getByLabel("New password").fill("a long enough new password");
  await password.getByRole("button", { name: "Change password" }).click();
  await expect(password.getByText("That is not your current password.")).toBeVisible();
});

test("changes the password, and signs in with the new one", async ({ page }) => {
  await signIn(page, start);
  await page.goto("/en/app/profile");

  const next = `a new password ${Date.now()}`;
  const password = panel(page, "Password");
  await password.getByLabel("Current password").fill(secret);
  await password.getByLabel("New password").fill(next);
  await password.getByRole("button", { name: "Change password" }).click();
  await expect(password.getByRole("status")).toHaveText(
    "Password changed. You're signed out everywhere else.",
  );
  secret = next;

  await signIn(page, start);
});

test("moves the address only when the link sent to the new one is opened", async ({
  page,
}) => {
  await signIn(page, start);
  await page.goto("/en/app/profile");

  const email = panel(page, "Email");
  await expect(email.getByText(`Your address is ${start}.`)).toBeVisible();

  // The address the account already has.
  await email.getByLabel("New email").fill(start);
  await email.getByLabel("Current password").fill(secret);
  await email.getByRole("button", { name: "Send link" }).click();
  await expect(email.getByText("That is already your address.")).toBeVisible();

  await email.getByLabel("New email").fill(moved);
  await email.getByLabel("Current password").fill(secret);
  await email.getByRole("button", { name: "Send link" }).click();
  await expect(email.getByRole("status")).toContainText(`Check ${moved}.`);

  // Nothing moved yet.
  await page.reload();
  await expect(panel(page, "Email").getByText(`Your address is ${start}.`)).toBeVisible();

  // The link is in the account's language, Georgian since the first test.
  await page.context().clearCookies();
  await page.goto(changeLink("ka", moved));
  await page.getByRole("button", { name: "ელფოსტის დადასტურება" }).click();
  await expect(page).toHaveURL(/\/ka\/app$/, { timeout: firstCompile });

  await signIn(page, moved);
});

// C4 (ADR-044): deleting the account. The observer has a paid slot ahead, a held one, a
// refund owed and a live mission, so the platform names what to settle first; the
// leaving account has nothing, and goes.
async function signInAs(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
}

test("says what to settle before an account can be deleted, and keeps it", async ({ page }) => {
  await signInAs(page, "observer@darkview.test");
  await page.goto("/en/app/profile");

  const deletion = panel(page, "Delete your account");
  await deletion.getByLabel("Current password").fill("correct horse battery");
  await deletion.getByLabel("I understand that this cannot be undone.").check();
  await deletion.getByRole("button", { name: "Delete my account" }).click();

  const alert = deletion.getByRole("alert");
  await expect(alert).toContainText("Your account cannot be deleted yet:");
  await expect(alert).toContainText("An observation of yours is not over yet.");
  await expect(alert).toContainText("A paid slot of yours is still ahead.");
  await expect(alert).toContainText("A slot is held for you awaiting payment.");
  await expect(alert).toContainText("A refund or a free slot is owed to you.");

  await page.goto("/en/app/profile");
  await expect(page).toHaveURL(/\/en\/app\/profile$/);
});

test("deletes the account after the password, and it cannot sign in again", async ({
  page,
}) => {
  await signInAs(page, "leaving@darkview.test");
  await page.goto("/en/app/profile");

  const deletion = panel(page, "Delete your account");
  await expect(deletion).toContainText("Your loyalty points are lost.");
  await deletion.getByLabel("Current password").fill("not my password at all");
  await deletion.getByLabel("I understand that this cannot be undone.").check();
  await deletion.getByRole("button", { name: "Delete my account" }).click();
  await expect(deletion.getByText("That is not your current password.")).toBeVisible();

  // The form resets after every answer, as React's form actions do: the box is asked
  // for again, each time.
  await deletion.getByLabel("Current password").fill("correct horse battery");
  await deletion.getByLabel("I understand that this cannot be undone.").check();
  await deletion.getByRole("button", { name: "Delete my account" }).click();
  await expect(deletion.getByRole("status")).toHaveText("Your account has been deleted.");

  await deletion.getByRole("link", { name: "Go to the home page" }).click();
  await expect(page).toHaveURL(/\/en$/);

  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("leaving@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
});
