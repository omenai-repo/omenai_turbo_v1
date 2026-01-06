import { InvoiceTypes } from "@omenai/shared-types";

import { chromium } from "playwright";
import { renderInvoiceHTML } from "./invoiceTemplate";
import { uploadInvoicePdf } from "./uploadInvoicePdf";

export async function generateInvoicePdf(
  invoice: Omit<InvoiceTypes, "storage" | "document_created" | "receipt_sent">
) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(renderInvoiceHTML(invoice), {
    waitUntil: "networkidle",
  });

  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return buffer; // ✅ REAL Buffer
}
