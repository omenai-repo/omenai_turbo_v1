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

vi.mock("@omenai/shared-utils/src/getFutureShipmentDate", () => ({
  getFutureShipmentDate: vi.fn(),
}));

vi.mock("../../../app/api/shipment/resources", () => ({
  getDhlHeaders: vi.fn().mockReturnValue(new Headers()),
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT: "TEST_ACCOUNT",
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  validateRequestBody: vi.fn(),
}));

vi.mock("../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ message: "Unexpected error", status: 500 }),
}));

import { POST } from "../../../app/api/shipment/create_pickup/route";
import {
  createErrorRollbarReport,
  validateRequestBody,
} from "../../../app/api/util";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";

function makeRequest(): Request {
  return new Request("http://localhost/api/shipment/create_pickup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

const validParsedBody = {
  originCountryCode: "FR",
  specialInstructions: "Handle with care",
  artistDetails: {
    address: {
      address_line: "1 Rue de Rivoli",
      city: "Paris",
      country: "France",
      countryCode: "FR",
      state: "Île-de-France",
      stateCode: "IDF",
      zip: "75001",
    },
    email: "artist@example.com",
    phone: "+33123456789",
    fullname: "Jean Dupont",
  },
  shipment_product_code: "P",
  dimensions: { length: 80, width: 60, height: 5, weight: 3 },
};

const mockDhlPickupResponse = {
  dispatchConfirmationNumbers: ["PICKUP-12345"],
};

describe("POST /api/shipment/create_pickup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateRequestBody).mockResolvedValue(validParsedBody);
    vi.mocked(getFutureShipmentDate).mockResolvedValue("2026-05-02T12:00:00");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockDhlPickupResponse),
      }),
    );
  });

  it("returns 200 with DHL pickup confirmation on success", async () => {
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data).toEqual(mockDhlPickupResponse);
  });

  it("sends artist address as pickup details in DHL payload", async () => {
    await POST(makeRequest());

    const [, fetchInit] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(fetchInit!.body as string);

    expect(
      payload.customerDetails.pickupDetails.postalAddress.postalCode,
    ).toBe(validParsedBody.artistDetails.address.zip);
    expect(
      payload.customerDetails.pickupDetails.contactInformation.email,
    ).toBe(validParsedBody.artistDetails.email);
  });

  it("includes special instructions in DHL payload", async () => {
    await POST(makeRequest());

    const [, fetchInit] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(fetchInit!.body as string);

    expect(payload.specialInstructions[0].value).toContain("Handle with care");
  });

  it("returns 500 and calls rollbar on error", async () => {
    const err = new Error("DHL API failure");
    vi.mocked(validateRequestBody).mockRejectedValue(err);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: create pickup",
      err,
      expect.any(Number),
    );
    expect(body.message).toBe("Error");
  });
});
