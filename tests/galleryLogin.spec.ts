import { test } from "@playwright/test";

test("gallery login", async ({ page }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.goto(
    "https://staging.auth.omenai.app/login/user?redirect=https%3A%2F%2Fstaging.omenai.app%2F",
  );
  await page.getByRole("link", { name: "Gallery Portal" }).click();
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
