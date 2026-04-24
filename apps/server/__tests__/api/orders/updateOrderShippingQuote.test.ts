import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOneAndUpdate: vi.fn() },
}));

vi.mock("@omenai/shared-emails/src/models/orders/orderAcceptedMail", () => ({
  sendOrderAcceptedMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateRequestBody: vi.fn().mockImplementation(async (request: Request, schema: any) => {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new BadRequestError("Invalid JSON syntax: Request body could not be parsed.");
      }
      const result = schema.safeParse(body);
      if (!result.success) {
        const msg = result.error.issues
          .map((e: any) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new BadRequestError(`Validation Failed: ${msg}`);
      }
      return result.data;
    }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../app/api/orders/updateOrderShippingQuote/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";

const mockOrder = {
  order_id: "order-abc",
  buyer_details: { name: "John Buyer", email: "buyer@test.com", id: "user-1" },
  artwork_data: { title: "Test Art" },
};

const validBody = { order_id: "order-abc", quote_data: "250.00" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/updateOrderShippingQuote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/updateOrderShippingQuote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(mockOrder as any);
  });

  it("returns 200 and sends accepted email when quote updated", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully updated quote data");
    expect(sendOrderAcceptedMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@test.com" }),
    );
  });

  it("returns 500 when order not found", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/could not be updated/i);
  });

  it("returns 400 when quote_data is missing", async () => {
    const response = await POST(makeRequest({ order_id: "order-abc" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(makeRequest({ quote_data: "250.00" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
