import { test, expect } from "@playwright/test";

test("Artist Flow", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.goto(
    "http://localhost:4000/login/user?redirect=http%3A%2F%2Flocalhost%3A3000%2F",
  );
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
  await page.goto("http://localhost:5000/artist/app/overview");
  await page.getByRole("link", { name: "My Artworks" }).click();
  await page.getByRole("button", { name: "Upload Artwork" }).click();
  await page.getByRole("link", { name: "Wallet" }).click();
  await page.getByRole("button", { name: "Show balance" }).click();
  await page.getByRole("button", { name: "Withdraw Funds" }).click();
  await page
    .getByText(
      "Wallet Withdrawal currently InactiveWe’re working on a brief fix to our wallet",
    )
    .click();
  await page.getByRole("button").nth(1).click();
  await page.getByRole("link", { name: "Orders" }).click();
  await page.getByRole("tab", { name: "In Progress" }).click();
  await page.getByRole("tab", { name: "Completed" }).click();
});
