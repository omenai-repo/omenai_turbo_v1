import { expect, test } from "@playwright/test";
test("Collector login with valid Data", async ({ page }) => {
  await page.goto("https://staging.auth.omenai.app/login/user");
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("textbox", { name: "Enter your password" });
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await expect(page).toHaveURL("https://staging.omenai.app/");
});
