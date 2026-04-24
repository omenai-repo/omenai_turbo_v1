import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOne: vi.fn(), updateOne: vi.fn() },
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
    validateDHLAddress: vi.fn().mockResolvedValue(undefined),
    createErrorRollbarReport: vi.fn(),
  };
});

import { PATCH } from "../../../app/api/orders/updateOrderPickupAddress/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { validateDHLAddress } from "../../../app/api/util";

const mockOrder = {
  order_id: "order-abc",
  shipping_details: {
    addresses: {
      destination: { countryCode: "GB", city: "London", state: "England", zip: "SW1A", country: "UK" },
    },
  },
};

const dhlPickupAddress = {
  address_line: "10 Test St",
  state: "Berlin",
  country: "DE",
  city: "Berlin",
  zip: "10115",
  stateCode: "BE",
  countryCode: "DE",
};

const upsPickupAddress = {
  address_line: "100 Main St",
  state: "CA",
  country: "US",
  city: "Los Angeles",
  zip: "90001",
  stateCode: "CA",
  countryCode: "US",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/updateOrderPickupAddress", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/orders/updateOrderPickupAddress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOrder),
    } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 and validates DHL address for international shipment", async () => {
    const response = await PATCH(
      makeRequest({ type: "pickup", order_id: "order-abc", pickupAddress: dhlPickupAddress }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Pickup address verified successfully");
    expect(validateDHLAddress).toHaveBeenCalled();
  });

  it("returns 200 and skips DHL validation for domestic US shipment", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        ...mockOrder,
        shipping_details: {
          addresses: {
            destination: { countryCode: "US", city: "NYC", state: "NY", zip: "10001", country: "US" },
          },
        },
      }),
    } as any);

    const response = await PATCH(
      makeRequest({ type: "pickup", order_id: "order-abc", pickupAddress: upsPickupAddress }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(validateDHLAddress).not.toHaveBeenCalled();
  });

  it("returns 404 when order not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await PATCH(
      makeRequest({ type: "pickup", order_id: "missing", pickupAddress: dhlPickupAddress }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/No Order record/i);
  });

  it("returns 500 when DHL address validation fails", async () => {
    vi.mocked(validateDHLAddress).mockRejectedValue(
      new Error("We cannot ship to this address"),
    );

    const response = await PATCH(
      makeRequest({ type: "pickup", order_id: "order-abc", pickupAddress: dhlPickupAddress }),
    );
    const body = await response.json();

    // plain Error doesn't match any name in errorStatusMap → 500
    expect(response.status).toBe(500);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await PATCH(
      makeRequest({ type: "pickup", pickupAddress: dhlPickupAddress }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
