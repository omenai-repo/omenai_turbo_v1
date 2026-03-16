import { expect, test } from "@playwright/test";

test("gallery login with valid data", async ({ page }) => {
  await page.goto("https://staging.auth.omenai.app/login/gallery");
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your Password" })
    .fill("Test12345@");
  await page
    .getByRole("textbox", { name: "Enter your Password" })
    .press("Enter");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.goto("https://staging.dashboard.omenai.app/gallery/overview");
});
