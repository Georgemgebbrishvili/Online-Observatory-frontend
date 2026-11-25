import { expect, test } from "@playwright/test";

// ADR-106: the booking board is open to a visitor without an account. Choosing is free;
// booking asks them to sign in and brings them back to the slot they chose.

test("a visitor without an account browses the board, and signs in only to book", async ({
  page,
}) => {
  await page.goto("/en/app/book");
  await expect(page).toHaveURL(/\/en\/book$/);

  await expect(
    page.getByRole("heading", { level: 1, name: "Time on the telescope." }),
  ).toBeVisible();
  await expect(
    page.getByRole("radiogroup", { name: "Choose a night" }).getByRole("radio"),
  ).toHaveCount(7);
  // The platform's own price for the half hour the board picked, not one written here.
  await expect(page.locator(".board-total strong")).toHaveText(/\d/);
  await expect(page.getByRole("button", { name: "Reserve and pay" })).toHaveCount(0);
  await expect(page.getByText("You pay after you sign in.")).toBeVisible();

  await page.getByRole("button", { name: "Sign in to book" }).click();
  await expect(page).toHaveURL(/\/en\/sign-in\?next=%2Fen%2Fapp%2Fbook%3FstartAt/);
  const chosen = new URL(
    new URL(page.url()).searchParams.get("next") ?? "",
    "http://localhost",
  ).searchParams.get("startAt");

  await page.getByLabel("Email").fill("observer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/en\/app\/book\?startAt=/);
  expect(new URL(page.url()).searchParams.get("startAt")).toBe(chosen);
  await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeEnabled();
});

test("sign-in ignores a return address that is not the booking board", async ({ page }) => {
  await page.goto("/en/sign-in?next=https%3A%2F%2Fexample.com%2F");
  await page.getByLabel("Email").fill("observer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/);
});

test("the board without an account reads in Georgian", async ({ page }) => {
  await page.goto("/ka/book");
  await expect(page.getByRole("button", { name: "შედი და დაჯავშნე" })).toBeVisible();
});
