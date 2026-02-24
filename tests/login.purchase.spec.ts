import { test } from "@playwright/test";

test("user login", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
});

test("artist login and account management", async ({ page }) => {
  await page.goto("http://localhost:3000/");
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
  await page.goto("http://localhost:5000/artist/app/overview");
  await page.getByRole("link", { name: "Orders" }).click();
  await page.getByRole("link", { name: "My Artworks" }).click();
  await page.getByRole("link", { name: "Account Management" }).click();
  await page.getByRole("link", { name: "Overview" }).click();
  await page.getByRole("link", { name: "omenai logo" }).click();
});

test("gallery login and account management", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByText("Create AccountLog in").click();
  await page.goto(
    "http://localhost:4000/register?redirect=http%3A%2F%2Flocalhost%3A3000%2F",
  );
  await page.getByRole("link", { name: "Sign In" }).click();
  await page.getByRole("link", { name: "Portal Gallery" }).click();
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your Password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.goto("http://localhost:5000/gallery/overview");
  await page.getByRole("link", { name: "View order details" }).click();
  await page.getByRole("link", { name: "My Artworks" }).click();
  await page.getByRole("link", { name: "Subscription & Billing" }).click();
  await page.getByRole("link", { name: "Payouts" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
});
