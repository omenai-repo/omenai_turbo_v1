import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
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
  CreateOrder: { findOne: vi.fn() },
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

import { POST } from "../../../app/api/orders/getSingleOrder/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const mockOrder = { order_id: "order-abc", artwork_data: { title: "Test Art" } };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/getSingleOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/getSingleOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOrder),
    } as any);
  });

  it("returns 200 with order data", async () => {
    const response = await POST(makeRequest({ order_id: "order-abc" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockOrder);
    expect(CreateOrder.findOne).toHaveBeenCalledWith({ order_id: "order-abc" });
  });

  it("returns 500 when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ order_id: "missing" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/No order matching/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
