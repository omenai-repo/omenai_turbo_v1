/**
 * Integration tests for GET /api/invoices/fetchInvoice
 * Validates invoiceNumber query param, fetches invoice by number, returns invoice data.
 */
import { describe, it, expect, afterEach } from "vitest";
import { Invoice } from "@omenai/shared-models/models/invoice/InvoiceSchema";
import { GET } from "../../../app/api/invoices/fetchInvoice/route";

function makeInvoice(overrides: Record<string, any> = {}) {
  return {
    invoiceNumber: `OMENAI-INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    recipient: {
      userId: "user-001",
      address: { city: "NY" },
      name: "Test User",
      email: "user@test.com",
    },
    orderId: "order-001",
    currency: "USD",
    lineItems: { description: "Test Artwork", quantity: 1, unitPrice: 500 },
    pricing: { taxes: 10, shipping: 20, unitPrice: 500, total: 530 },
    paidAt: new Date(),
    ...overrides,
  };
}

function makeRequest(params?: { id?: string }): Request {
  const url = new URL("http://localhost/api/invoices/fetchInvoice");
  if (params?.id !== undefined) {
    url.searchParams.set("id", params.id);
  }
  return new Request(url.toString(), { method: "GET" });
}

afterEach(async () => {
  await Invoice.deleteMany({});
});

describe("GET /api/invoices/fetchInvoice — validation", () => {
  it("returns 400 when the ?id query param is missing", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(400);
  });
});

describe("GET /api/invoices/fetchInvoice — not found", () => {
  it("returns 200 with invoice: null when no matching invoice exists", async () => {
    const response = await GET(makeRequest({ id: "OMENAI-INV-NOTEXIST" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.invoice).toBeNull();
  });
});

describe("GET /api/invoices/fetchInvoice — success", () => {
  it("returns 200 with the invoice when it exists", async () => {
    const fixture = makeInvoice();
    await Invoice.create(fixture);

    const response = await GET(makeRequest({ id: fixture.invoiceNumber }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Invoice data retrieved");
    expect(body.invoice).not.toBeNull();
    expect(body.invoice.invoiceNumber).toBe(fixture.invoiceNumber);
    expect(body.invoice.orderId).toBe(fixture.orderId);
    expect(body.invoice.currency).toBe(fixture.currency);
  });

  it("returns correct recipient fields in the fetched invoice", async () => {
    const fixture = makeInvoice();
    await Invoice.create(fixture);

    const response = await GET(makeRequest({ id: fixture.invoiceNumber }));
    const body = await response.json();

    expect(body.invoice.recipient.name).toBe("Test User");
    expect(body.invoice.recipient.email).toBe("user@test.com");
  });
});
