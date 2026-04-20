import { test } from "@playwright/test";

test("Admin login with valid data", async ({ page }) => {
  await page.goto("https://staging.admin.omenai.app/auth/login");
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Login to your account" }).click();
  await page.goto("https://staging.admin.omenai.app/admin/requests/gallery");
});
