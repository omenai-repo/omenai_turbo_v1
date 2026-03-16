import { expect, test } from "@playwright/test";

test("artist login with invalid data", async ({ page }) => {
  await page.goto("https://staging.auth.omenai.app/login/artist");
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus2@gmail.com");
  await page.getByRole("textbox", { name: "Enter your email address" });
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});
