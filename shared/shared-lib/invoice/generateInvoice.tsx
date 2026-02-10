import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from "pdf-lib";
import { InvoiceTypes } from "@omenai/shared-types";

/* ================= BRAND ================= */

const BRAND = {
  name: "OMENAI",
  logoUrl:
    "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8",
};

const COLORS = {
  primary: rgb(0.06, 0.09, 0.16),
  text: rgb(0.12, 0.12, 0.12),
  muted: rgb(0.55, 0.55, 0.55),
  divider: rgb(0.85, 0.85, 0.85),
};

/* ================= SPACING SYSTEM ================= */

const SPACING = {
  margin: 50,
  pageTop: 60,
  headerGap: 50,
  sectionGap: 40,
  rowGap: 25, // Increased from 18 to 25 for better separation in totals
  itemGap: 24,
  lineHeight: 14,
};

/* ================= MAIN ================= */

export async function generateInvoicePdf(
  invoice: Omit<InvoiceTypes, "storage" | "document_created" | "receipt_sent">,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Start Y position
  let y = height - SPACING.pageTop;
  const leftMargin = SPACING.margin;
  const rightMargin = width - SPACING.margin;

  /* ================= LOGO & TITLE ================= */

  // Draw Logo (Left)
  const logo = await embedLogo(pdfDoc, BRAND.logoUrl);
  const logoDims = logo.scale(0.26);

  page.drawImage(logo, {
    x: leftMargin,
    y: y - logoDims.height + 5,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Draw Header Details (Right)
  const headerX = width - 260;

  page.drawText("Payment Receipt", {
    x: headerX,
    y: y,
    size: 20,
    font: fontBold,
    color: COLORS.primary,
  });

  y -= 25;

  drawMutedLabelValue(
    page,
    "Receipt #:",
    invoice.invoiceNumber,
    headerX,
    y,
    font,
    fontBold,
  );
  y -= 18;
  drawMutedLabelValue(
    page,
    "Date:",
    formatDate(invoice.paidAt),
    headerX,
    y,
    font,
    fontBold,
  );

  y -= SPACING.headerGap;

  /* ================= ADDRESSES ================= */
  const addressY = y;

  // Column 1: From
  drawSectionTitle(page, "From", leftMargin, addressY, fontBold);

  drawTextBlock(
    page,
    [
      "Omenai Inc.",
      "2035 S State St",
      "Illinois, US 60616",
      "contact@omenai.app",
    ],
    leftMargin,
    addressY - 20,
    font,
  );

  // Column 2: Bill To
  drawSectionTitle(page, "Bill To", headerX, addressY, fontBold);

  drawTextBlock(
    page,
    [
      invoice.recipient.name,
      invoice.recipient.address.address_line,
      `${invoice.recipient.address.city}, ${invoice.recipient.address.state} ${invoice.recipient.address.zip}`,
      invoice.recipient.address.country,
      invoice.recipient.email,
    ],
    headerX,
    addressY - 20,
    font,
  );

  y -= 100;

  /* ================= LINE ITEMS TABLE ================= */

  drawDivider(page, leftMargin, y, rightMargin);
  y -= 20;

  // Table Columns
  const col1 = leftMargin;
  const col2 = 340; // Qty
  const col3 = 390; // Unit Price
  // col4 is calculated using right-alignment helper inside the loop

  drawMutedText(page, "ITEM DESCRIPTION", col1, y, font, 9);
  drawMutedText(page, "QTY", col2, y, font, 9);
  drawMutedText(page, "UNIT PRICE", col3, y, font, 9);
  // Manually right align header for "Amount"
  drawRightAlignedText(page, "AMOUNT", rightMargin, y, font, 9, COLORS.muted);

  y -= 25;

  for (const item of invoice.lineItems) {
    const wrapped = wrapText(item.description, font, 10, 240);
    const startY = y;

    // Draw Description
    for (let i = 0; i < wrapped.length; i++) {
      page.drawText(wrapped[i], {
        x: col1,
        y: y,
        size: 10,
        font,
        color: COLORS.text,
      });
      y -= SPACING.lineHeight;
    }

    // Draw Numbers (First line only)
    page.drawText(String(item.quantity), {
      x: col2,
      y: startY,
      size: 10,
      font,
      color: COLORS.text,
    });

    page.drawText(money(item.unitPrice, invoice.currency), {
      x: col3,
      y: startY,
      size: 10,
      font,
      color: COLORS.text,
    });

    // Right Align the Total Amount
    drawRightAlignedText(
      page,
      money(item.unitPrice * item.quantity, invoice.currency),
      rightMargin,
      startY,
      fontBold,
      10,
      COLORS.text,
    );

    y -= SPACING.itemGap - SPACING.lineHeight;
  }

  /* ================= TOTALS SECTION ================= */

  y -= 10;
  drawDivider(page, leftMargin, y, rightMargin);
  y -= 35; // Increased gap after divider

  const totalsLabelX = width - 260;

  // Helper to draw a total row with proper right alignment
  const drawTotalLine = (
    label: string,
    value: string,
    isBold = false,
    isDiscount = false,
  ) => {
    page.drawText(label, {
      x: totalsLabelX,
      y,
      size: 11,
      font,
      color: COLORS.muted,
    });

    // Use Right Alignment logic so the right-most digit is always at the margin
    const valueColor = isDiscount ? rgb(0.8, 0, 0) : COLORS.text; // Optional: Make discount red? kept simple below.
    drawRightAlignedText(
      page,
      value,
      rightMargin,
      y,
      isBold ? fontBold : font,
      11,
      COLORS.text,
    );

    y -= SPACING.rowGap;
  };

  drawTotalLine("Subtotal", money(invoice.pricing.unitPrice, invoice.currency));
  drawTotalLine("Shipping", money(invoice.pricing.shipping, invoice.currency));
  drawTotalLine("Tax", money(invoice.pricing.taxes, invoice.currency));

  if (invoice.pricing.discount) {
    drawTotalLine(
      "Discount",
      `- ${money(invoice.pricing.discount, invoice.currency)}`,
    );
  }

  // Final Total Divider
  y -= 5;
  drawDivider(page, totalsLabelX, y, rightMargin);
  y -= 25;

  // Grand Total
  page.drawText("Total Paid", {
    x: totalsLabelX,
    y,
    size: 14,
    font: fontBold,
    color: COLORS.primary,
  });

  drawRightAlignedText(
    page,
    money(invoice.pricing.total, invoice.currency),
    rightMargin,
    y,
    fontBold,
    14,
    COLORS.primary,
  );

  return Buffer.from(await pdfDoc.save());
}

/* ================= HELPERS ================= */

async function embedLogo(pdfDoc: PDFDocument, url: string) {
  const res = await fetch(url);
  const bytes = await res.arrayBuffer();
  return pdfDoc.embedPng(bytes);
}

function drawSectionTitle(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
) {
  page.drawText(text.toUpperCase(), {
    x,
    y,
    size: 10,
    font,
    color: COLORS.muted,
  });
}

function drawTextBlock(
  page: PDFPage,
  lines: string[],
  x: number,
  startY: number,
  font: PDFFont,
) {
  let y = startY;
  for (const line of lines) {
    page.drawText(line, {
      x,
      y,
      size: 11,
      font,
      color: COLORS.text,
    });
    y -= 15;
  }
}

function drawDivider(page: PDFPage, x1: number, y: number, x2: number) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 1,
    color: COLORS.divider,
  });
}

function drawMutedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size = 10,
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: COLORS.muted,
  });
}

function drawMutedLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  font: PDFFont,
  fontBold: PDFFont,
) {
  page.drawText(label, {
    x,
    y,
    size: 10,
    font,
    color: COLORS.muted,
  });

  page.drawText(value, {
    x: x + 60,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.text,
  });
}

/**
 * Calculates text width and draws it anchored to the right.
 * This ensures "10.00" and "1000.00" align on the decimal point side.
 */
function drawRightAlignedText(
  page: PDFPage,
  text: string,
  anchorX: number,
  y: number,
  font: PDFFont,
  size: number,
  color: any,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: anchorX - textWidth,
    y,
    size,
    font,
    color,
  });
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function money(amount: number, currency: string): string {
  // Use "en-US" generally to ensure standard decimal points,
  // but rely on currencyDisplay: "narrowSymbol" to hide the "US" prefix
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol", // Shows "$" instead of "US$", "₦" instead of "NGN"
  }).format(amount);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
