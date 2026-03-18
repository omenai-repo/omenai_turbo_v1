import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://staging.omenai.app/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByRole("textbox", { name: "Enter your email address" }).click();
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill("dantereus1@gmail.com");
  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .press("Tab");
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill("Test12345@");
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .press("Enter");
  await page.getByRole("button", { name: "Sign In to Omenai" }).click();
  await page.getByRole("button", { name: "Moses" }).click();
  await page.getByRole("link", { name: "Orders & Bids" }).click();
  await page.locator(".h-8").first().click();
  await page.getByRole("tab", { name: "In Progress" }).click();
  await page
    .locator(
      "#mantine-8okddrcsk-panel-processing > .flex.flex-col.gap-4 > div > .p-5 > .flex.items-center.gap-6 > .flex.items-center.gap-4 > .h-8 > .lucide",
    )
    .first()
    .click();
  await page.getByRole("button", { name: "Pay for this artwork" }).click();
  await page.getByRole("button", { name: "Complete Purchase" }).click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("button", { name: "Pay USD" })
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
    .getByRole("textbox", { name: "VALID TILL" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "VALID TILL" })
    .fill("12/30");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .click();
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("123");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("button", { name: "Pay USD" })
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page
    .locator('iframe[name="checkout"]')
    .contentFrame()
    .getByRole("button", { name: "Proceed" })
    .click();
  const page1 = await page1Promise;
  await page1.getByRole("textbox", { name: "Enter OTP" }).click();
  await page1.getByRole("textbox", { name: "Enter OTP" }).fill("000000");
  await page1.getByRole("button", { name: "Submit OTP" }).click();
  await page.goto(
    "https://staging.omenai.app/verifyTransaction?status=successful&tx_ref=RFfJRtD34KOM37xd&transaction_id=10102027",
  );
  await page.getByRole("link", { name: "Return to dashboard" }).click();
});
