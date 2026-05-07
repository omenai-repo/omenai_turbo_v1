import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/invoice/InvoiceSchema", () => ({
  Invoice: { findOne: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/invoices/fetchInvoice/route";
import { Invoice } from "@omenai/shared-models/models/invoice/InvoiceSchema";
import { validateGetRouteParams } from "../../../app/api/util";

const mockInvoice = {
  invoiceNumber: "INV-001",
  amount: 1500,
  buyer: "collector@test.com",
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/invoices/fetchInvoice");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/invoices/fetchInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Invoice.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockInvoice),
    } as any);
    vi.mocked(validateGetRouteParams).mockImplementation((schema: any, data: any) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw Object.assign(new Error("Invalid URL parameters"), { name: "BadRequestError" });
      }
      return data;
    });
  });

  it("returns 200 with invoice data on success", async () => {
    const response = await GET(makeRequest({ id: "INV-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Invoice data retrieved");
    expect(body.invoice).toEqual(mockInvoice);
  });

  it("queries Invoice by invoiceNumber", async () => {
    await GET(makeRequest({ id: "INV-001" }));

    expect(Invoice.findOne).toHaveBeenCalledWith({ invoiceNumber: "INV-001" });
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });

  it("returns 500 when findOne throws", async () => {
    vi.mocked(Invoice.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET(makeRequest({ id: "INV-001" }));

    expect(response.status).toBe(500);
  });
});
