import { test } from "@playwright/test";

test("purchase", async ({ page }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Artworkww" }).first().click();
  await page.getByRole("button", { name: "Buy Artwork" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "••••••••" }).click();
  await page.getByRole("textbox", { name: "••••••••" }).fill("Test12345@");
  await page.getByRole("button", { name: "Login to your account" }).click();
  await page.getByRole("button", { name: "Buy Artwork" }).click();
  await page.getByRole("button", { name: "Submit Purchase Request" }).click();
});
