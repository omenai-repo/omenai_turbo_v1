import { test, expect } from "@playwright/test";

test("userFlow", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Collect" })
    .click();
  await page.goto("http://localhost:3000/catalog");
  await page.getByRole("button", { name: "Filter works" }).click();
  await page.getByText("Price Range+").click();
  await page.getByText("−").click();
  await page.getByText("Year of Creation+").click();
  await page.getByText("−").click();
  await page.getByRole("button").nth(1).click();
  await page.getByRole("link", { name: "Editorials" }).first().click();
  await page
    .getByRole("link")
    .filter({ hasText: "Wed, 24 Sep, 2025 12:36" })
    .click();
  await page.getByRole("link", { name: "omenai logo" }).nth(1).click();
  await page.getByRole("link", { name: "Log in" }).click();
  await page.goto(
    "http://localhost:4000/login/user?redirect=http%3A%2F%2Flocalhost%3A3000%2Farticles%2F2WQaQfy6%3Fid%3D68d3e5d60020a423e6d5",
  );
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.getByRole("button", { name: "Moses" }).nth(1).click();
  await page.getByRole("link", { name: "My Collection" }).click();
  await page.goto("http://localhost:5000/user/saves");
  await page.getByRole("link", { name: "Orders" }).click();
  await page.getByRole("tab", { name: "In Progress" }).click();
  await page.getByRole("tab", { name: "Completed" }).click();
  await page
    .locator(
      "#mantine-xi3nyr0pd-panel-completed > .flex.flex-col.gap-4 > div > .p-5 > .flex.items-center.gap-6 > .flex.items-center.gap-4 > .h-8 > .lucide",
    )
    .first()
    .click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("link", { name: "Support tickets" }).click();
  await page.getByRole("link", { name: "Settings" }).click();
});
