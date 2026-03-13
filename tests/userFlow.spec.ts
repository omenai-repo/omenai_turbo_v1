import { test } from "@playwright/test";
test("Collector Account Flow", async ({ page }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .press("Enter");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.getByRole("button", { name: "Moses" }).click();
  await page.getByRole("link", { name: "Account Settings" }).click();
  await page.getByRole("link", { name: "Saved Artworks" }).click();
  await page.goto("https://staging.dashboard.omenai.app/user/saves");
  await page.getByRole("link", { name: "Orders" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("link", { name: "Support tickets" }).click();
});
