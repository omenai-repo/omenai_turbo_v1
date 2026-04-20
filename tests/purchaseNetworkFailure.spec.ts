import { test } from "@playwright/test";

test("purchase - goes offline before submit", async ({ page, context }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Colors of Heaven" }).first().click();
  await page.getByRole("button", { name: "Buy Artwork" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("dantereus1@gmail.com");
  await page.getByRole("textbox", { name: "••••••••" }).click();
  await page.getByRole("textbox", { name: "••••••••" }).fill("Test12345@");
  await page.getByRole("button", { name: "Login to your account" }).click();
  await page.getByRole("button", { name: "Buy Artwork" }).click();

  await context.setOffline(true);

  await page.getByRole("button", { name: "Submit Purchase Request" }).click();

  await page
    .getByText(
      "An error was encountered, please try again later or contact support",
    )
    .waitFor();
});
