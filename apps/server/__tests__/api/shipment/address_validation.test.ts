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

vi.mock(
  "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData",
  () => ({
    validateAddressVerificationRequestData: vi.fn(),
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  validateDHLAddress: vi.fn(),
}));

import { POST } from "../../../app/api/shipment/address_validation/route";
import { validateAddressVerificationRequestData } from "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData";
import { validateDHLAddress, createErrorRollbarReport } from "../../../app/api/util";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/shipment/address_validation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  type: "delivery",
  countryCode: "US",
  postalCode: "10001",
  cityName: "New York",
  countyName: "New York",
  country: "United States",
};

const mockDHLResponse = {
  address: [{ addressLine1: "123 Main St", cityName: "New York" }],
};

describe("POST /api/shipment/address_validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateAddressVerificationRequestData).mockReturnValue(null);
    vi.mocked(validateDHLAddress).mockResolvedValue(mockDHLResponse);
  });

  it("returns 200 with DHL data on valid address", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data).toEqual(mockDHLResponse);
    expect(validateDHLAddress).toHaveBeenCalledWith(validBody);
  });

  it("returns 400 when request validation fails", async () => {
    vi.mocked(validateAddressVerificationRequestData).mockReturnValue(
      "postalCode is required",
    );

    const response = await POST(
      makeRequest({ type: "delivery", countryCode: "US" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/postalCode is required/i);
  });

  it("returns error when validateDHLAddress throws", async () => {
    vi.mocked(validateDHLAddress).mockRejectedValue(
      Object.assign(new Error("Bad address"), { statusCode: 400 }),
    );

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.message).toBeDefined();
  });

  it("calls createErrorRollbarReport on DHL error", async () => {
    const err = Object.assign(new Error("DHL failure"), { statusCode: 500 });
    vi.mocked(validateDHLAddress).mockRejectedValue(err);

    await POST(makeRequest(validBody));

    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: address validation",
      err,
      expect.any(Number),
    );
  });
});
