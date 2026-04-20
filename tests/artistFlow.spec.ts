import { test } from "@playwright/test";

test("Artist Flow", async ({ page }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByRole("link", { name: "Artist Portal" }).click();
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.goto("https://staging.dashboard.omenai.app/artist/app/overview");
  await page.getByRole("link", { name: "Orders" }).click();
  await page.getByRole("link", { name: "My Artworks" }).click();
  await page.getByRole("link", { name: "Wallet" }).click();
});
