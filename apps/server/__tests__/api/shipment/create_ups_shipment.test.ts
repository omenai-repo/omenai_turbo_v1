import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
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

vi.mock("../../../app/api/services/ups_service", () => ({
  createUPSShipment: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/shipment/create_ups_shipment/route";
import { createUPSShipment } from "../../../app/api/services/ups_service";
import { createErrorRollbarReport } from "../../../app/api/util";

const VALID_SECRET = "test-internal-secret";

function makeRequest(options: {
  secret?: string | null;
  body?: object;
}): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.secret !== null) {
    headers["x-internal-secret"] = options.secret ?? VALID_SECRET;
  }
  return new Request("http://localhost/api/shipment/create_ups_shipment", {
    method: "POST",
    headers,
    body: JSON.stringify(options.body ?? {}),
  });
}

const mockUPSShipmentData = {
  trackingNumber: "1Z999AA10123456784",
  label: "base64label==",
};

describe("POST /api/shipment/create_ups_shipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_SECRET = VALID_SECRET;
    vi.mocked(createUPSShipment).mockResolvedValue(mockUPSShipmentData as any);
  });

  it("returns 401 when internal secret header is missing", async () => {
    const request = makeRequest({ secret: null });
    // Remove the header entirely
    const headerlessRequest = new Request(
      "http://localhost/api/shipment/create_ups_shipment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      },
    );

    const response = await POST(headerlessRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
    expect(createUPSShipment).not.toHaveBeenCalled();
  });

  it("returns 401 when internal secret is incorrect", async () => {
    const response = await POST(makeRequest({ secret: "wrong-secret" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
    expect(createUPSShipment).not.toHaveBeenCalled();
  });

  it("returns 200 with shipment data on success", async () => {
    const shipmentBody = { orderId: "ORD-123", weight: 2 };
    const response = await POST(makeRequest({ body: shipmentBody }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Shipment created successfully");
    expect(body.data).toEqual(mockUPSShipmentData);
    expect(createUPSShipment).toHaveBeenCalledWith(shipmentBody);
  });

  it("returns 500 and calls rollbar when createUPSShipment throws", async () => {
    const err = new Error("UPS API failure");
    vi.mocked(createUPSShipment).mockRejectedValue(err);

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("UPS API failure");
    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "UPS Endpoint Error",
      err,
      500,
    );
  });

  it("returns generic error message when error has no message", async () => {
    vi.mocked(createUPSShipment).mockRejectedValue({});

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Failed to create UPS shipment");
  });
});
