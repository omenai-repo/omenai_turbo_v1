import { test, expect } from "@playwright/test";

test("artwork payment with invalid data", async ({ page }) => {
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
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.getByRole("button", { name: "Moses" }).click();
  await page.getByRole("link", { name: "Orders & Bids" }).click();
  await page.getByRole("tab", { name: "In Progress" }).click();
  await page.getByTestId("user-order-card").first().click();
  await page.getByRole("button", { name: "Pay for this artwork" }).click();
  await page.getByRole("button", { name: "Complete Purchase" }).click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .fill("1234 5678 9789 4242");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "VALID TILL" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "VALID TILL" })
    .fill("12/24");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("552");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("button", { name: "Pay USD" })
    .click();
  await expect(page.getByText("Invalid Expiry Date")).toBeVisible();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CARD NUMBER" })
    .fill("4242 4242 4242 4242");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("button", { name: "Pay USD" })
    .click();
  await expect(page.getByText("Invalid Expiry Date")).toBeVisible();
});
