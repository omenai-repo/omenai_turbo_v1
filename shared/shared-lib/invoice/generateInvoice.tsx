import { InvoiceTypes } from "@omenai/shared-types";

import { chromium as playwrightChromium } from "playwright-core";
import chromium from "@sparticuz/chromium";

import { renderInvoiceHTML } from "./invoiceTemplate";

export async function generateInvoicePdf(
  invoice: Omit<InvoiceTypes, "storage" | "document_created" | "receipt_sent">
) {
  chromium.setGraphicsMode = false;

  const browser = await playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(renderInvoiceHTML(invoice), {
      waitUntil: "networkidle",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "24px",
        bottom: "24px",
        left: "24px",
        right: "24px",
      },
    });
  } finally {
    await browser.close();
  }
}
