import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/invoice/InvoiceSchema", () => ({
  Invoice: {
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/shared-models/models/transactions/PurchaseTransactionSchema", () => ({
  PurchaseTransactions: { updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/shared-lib/invoice/generateInvoice", () => ({
  generateInvoicePdf: vi.fn(),
}));

vi.mock("@omenai/shared-lib/invoice/uploadInvoicePdf", () => ({
  uploadInvoicePdf: vi.fn(),
}));

vi.mock("@omenai/shared-emails/src/models/invoice/sendPurchaseInvoice", () => ({
  sendPurchaseInvoice: vi.fn().mockResolvedValue({ error: null }),
}));

import { POST } from "../../../../app/api/workflows/emails/sendPaymentInvoice/route";
import { Invoice } from "@omenai/shared-models/models/invoice/InvoiceSchema";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { uploadInvoicePdf } from "@omenai/shared-lib/invoice/uploadInvoicePdf";
import { sendPurchaseInvoice } from "@omenai/shared-emails/src/models/invoice/sendPurchaseInvoice";

const mockInvoice = {
  invoiceNumber: "INV-001",
  orderId: "order-123",
  recipient: { name: "John Buyer", email: "buyer@test.com" },
};

const mockDbInvoice = {
  invoiceNumber: "INV-001",
  recipient: { name: "John Buyer", email: "buyer@test.com" },
  document_created: false,
  storage: null,
  receipt_sent: false,
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/emails/sendPaymentInvoice",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/emails/sendPaymentInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Invoice.findOneAndUpdate).mockResolvedValue(mockDbInvoice as any);
    vi.mocked(generateInvoicePdf).mockResolvedValue(Buffer.from("pdf-content") as any);
    vi.mocked(uploadInvoicePdf).mockResolvedValue({ fileId: "file-123" } as any);
  });

  it("returns 200 with data true when all steps succeed", async () => {
    const response = await POST(makeRequest({ invoice: mockInvoice }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
  });

  it("returns 500 when invoice upsert returns null", async () => {
    vi.mocked(Invoice.findOneAndUpdate).mockResolvedValue(null);

    const response = await POST(makeRequest({ invoice: mockInvoice }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when PDF generation returns empty buffer", async () => {
    vi.mocked(generateInvoicePdf).mockResolvedValue(Buffer.alloc(0) as any);

    const response = await POST(makeRequest({ invoice: mockInvoice }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when PDF generation returns null", async () => {
    vi.mocked(generateInvoicePdf).mockResolvedValue(null as any);

    const response = await POST(makeRequest({ invoice: mockInvoice }));

    expect(response.status).toBe(500);
  });

  it("marks document_created when not already set", async () => {
    await POST(makeRequest({ invoice: mockInvoice }));

    expect(Invoice.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceNumber: "INV-001", document_created: false }),
      { $set: { document_created: true } },
    );
  });

  it("skips document creation when already created", async () => {
    vi.mocked(Invoice.findOneAndUpdate).mockResolvedValue({
      ...mockDbInvoice,
      document_created: true,
    } as any);

    await POST(makeRequest({ invoice: mockInvoice }));

    expect(Invoice.updateOne).not.toHaveBeenCalledWith(
      expect.objectContaining({ document_created: false }),
      expect.anything(),
    );
  });

  it("skips PDF upload when fileId already exists", async () => {
    vi.mocked(Invoice.findOneAndUpdate).mockResolvedValue({
      ...mockDbInvoice,
      storage: { fileId: "existing-file" },
    } as any);

    await POST(makeRequest({ invoice: mockInvoice }));

    expect(uploadInvoicePdf).not.toHaveBeenCalled();
  });

  it("sends receipt when not already sent", async () => {
    await POST(makeRequest({ invoice: mockInvoice }));

    expect(sendPurchaseInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockDbInvoice.recipient.name,
        email: mockDbInvoice.recipient.email,
      }),
    );
  });

  it("skips receipt when already sent", async () => {
    vi.mocked(Invoice.findOneAndUpdate).mockResolvedValue({
      ...mockDbInvoice,
      receipt_sent: true,
    } as any);

    await POST(makeRequest({ invoice: mockInvoice }));

    expect(sendPurchaseInvoice).not.toHaveBeenCalled();
  });
});
