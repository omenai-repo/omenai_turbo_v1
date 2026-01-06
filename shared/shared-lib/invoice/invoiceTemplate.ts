import { InvoiceTypes } from "@omenai/shared-types";

const BRAND = {
  name: "OMENAI",
  accent: "#0f172a", // example: refined violet (edit to yours)
  logoUrl:
    "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/6922f45000243c4d7bab/view?project=682272b1001e9d1609a8", // Appwrite / CDN
};

export function renderInvoiceHTML(
  invoice: Omit<InvoiceTypes, "storage" | "document_created" | "receipt_sent">
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111827;
      margin: 0;
      padding: 60px 64px;
      background: #ffffff;
      line-height: 1.45;
    }

    h1 {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    h2 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .muted {
      color: #6b7280;
      font-size: 13px;
    }

    .page {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 64px;
    }

.logo img {
  height: 36px;
  width: auto;
  display: block;
}


    .invoice-meta {
      text-align: right;
      font-size: 14px;
    }

    .invoice-meta div {
      margin-bottom: 4px;
    }

    /* Parties */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-bottom: 36px;
    }

    .address {
      font-size: 14px;
    }

    .address div {
      margin-bottom: 4px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 48px 0;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 48px;
    }

    thead th {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      text-align: left;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    tbody td {
      padding: 20px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 15px;
      vertical-align: top;
    }

    .col-desc { width: 55%; }
    .col-qty { width: 10%; text-align: center; }
    .col-unit { width: 15%; text-align: right; }
    .col-total { width: 20%; text-align: right; }

    /* Totals */
    .totals {
      display: flex;
      justify-content: flex-end;
    }

    .totals-box {
      width: 360px;
      font-size: 15px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }

    .totals-row.subtle {
      color: #6b7280;
    }

    .totals-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 16px 0;
    }

    .totals-row.total {
      font-size: 18px;
      font-weight: 600;
    }

    /* Footer */
    footer {
      margin-top: 36px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <img src="${BRAND.logoUrl}" alt="${BRAND.name}" />
    </div>


      <div class="invoice-meta">
        <h1>Invoice</h1>
        <div>Invoice #: ${invoice.invoiceNumber}</div>
        <div>Date paid: ${formatDate(invoice.paidAt)}</div>
      </div>
    </div>

    <!-- Sender / Recipient -->
    <div class="parties">
      <div>
        <h2>From</h2>
        <div class="address">
          <div>Omenai Art Marketplace Ltd.</div>
          <div>12 Victoria Island Way</div>
          <div>Lagos, Nigeria</div>
          <div>support@omenai.app</div>
        </div>
      </div>
      <div>
        <h2>Bill To</h2>
        <div class="address">
          <div>${invoice.recipient.name}</div>
          <div>${invoice.recipient.address.address_line}</div>
          <div>
            ${invoice.recipient.address.city},
            ${invoice.recipient.address.state}
            ${invoice.recipient.address.zip}
          </div>
          <div>${invoice.recipient.address.country}</div>
          <div>${invoice.recipient.email}</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Line items -->
    <table>
      <thead>
        <tr>
          <th class="col-desc">Description</th>
          <th class="col-qty">Qty</th>
          <th class="col-unit">Unit price</th>
          <th class="col-total">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems
          .map(
            (item) => `
          <tr>
            <td class="col-desc">${item.description}</td>
            <td class="col-qty">${item.quantity}</td>
            <td class="col-unit">${money(item.unitPrice, invoice.currency)}</td>
            <td class="col-total">${money(item.unitPrice * item.quantity, invoice.currency)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row subtle">
          <span>Subtotal</span>
          <span>${money(invoice.pricing.unitPrice, invoice.currency)}</span>
        </div>

        <div class="totals-row subtle">
          <span>Shipping</span>
          <span>${money(invoice.pricing.shipping, invoice.currency)}</span>
        </div>

        <div class="totals-row subtle">
          <span>Tax</span>
          <span>${money(invoice.pricing.taxes, invoice.currency)}</span>
        </div>

        ${
          invoice.pricing.discount
            ? `
          <div class="totals-row subtle">
            <span>Discount</span>
            <span>- ${money(invoice.pricing.discount, invoice.currency)}</span>
          </div>
        `
            : ""
        }

        <div class="totals-divider"></div>

        <div class="totals-row total">
          <span>Total Paid</span>
          <span>${money(invoice.pricing.total, invoice.currency)}</span>
        </div>
      </div>
    </div>

    <footer>
      Thank you for supporting OMENAI.<br />
      This invoice was generated electronically and is valid without a signature.
    </footer>
  </div>
</body>
</html>
`;
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
