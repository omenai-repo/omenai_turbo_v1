import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("../../../app/api/util", () => {
  class DhlProviderError extends Error {
    status: number;
    data: any;
    constructor(message: string, status: number, data?: any) {
      super(message);
      this.name = "DhlProviderError";
      this.status = status;
      this.data = data;
    }
  }
  return {
    createErrorRollbarReport: vi.fn(),
    getShipmentRates: vi.fn(),
    DhlProviderError,
  };
});

import { POST } from "../../../app/api/shipment/get_rate/route";
import {
  getShipmentRates,
  DhlProviderError,
  createErrorRollbarReport,
} from "../../../app/api/util";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/shipment/get_rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  originCountryCode: "US",
  originCityName: "New York",
  originPostalCode: "10001",
  destinationCountryCode: "GB",
  destinationCityName: "London",
  destinationPostalCode: "SW1A 1AA",
  weight: 2,
  dimensions: { length: 30, width: 20, height: 5 },
};

const mockProduct = {
  productCode: "P",
  productName: "DHL EXPRESS WORLDWIDE",
  chargeable_price_in_usd: 120.5,
};

describe("POST /api/shipment/get_rate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getShipmentRates).mockResolvedValue(mockProduct);
  });

  it("returns 200 with the appropriate DHL product", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.appropriateDHLProduct).toEqual(mockProduct);
  });

  it("returns DHL provider error status when DhlProviderError is thrown", async () => {
    const dhlError = new DhlProviderError("Service unavailable", 503, {
      detail: "DHL API down",
    });
    vi.mocked(getShipmentRates).mockRejectedValue(dhlError);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toBe("Service unavailable");
    expect(body.data).toEqual({ detail: "DHL API down" });
  });

  it("returns 500 on unexpected errors", async () => {
    vi.mocked(getShipmentRates).mockRejectedValue(new Error("Network error"));

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.message).toBeDefined();
  });

  it("calls createErrorRollbarReport on generic error", async () => {
    const err = new Error("unexpected failure");
    vi.mocked(getShipmentRates).mockRejectedValue(err);

    await POST(makeRequest(validBody));

    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: get rate",
      err,
      expect.any(Number),
    );
  });
});
