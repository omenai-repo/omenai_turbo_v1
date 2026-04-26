import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-utils/src/getFutureShipmentDate", () => ({
  getFutureShipmentDate: vi.fn(),
}));

vi.mock("../../../app/api/shipment/resources", () => ({
  getDhlHeaders: vi.fn().mockReturnValue(new Headers()),
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT: "TEST_ACCOUNT",
  SHIPMENT_API_URL:
    "https://express.api.dhl.com/mydhlapi/test/shipments",
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

vi.mock("../../../custom/errors/dictionary/errorDictionary", () => ({
  ServerError: class ServerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ServerError";
    }
  },
}));

import { POST } from "../../../app/api/shipment/create_shipment/route";
import {
  createErrorRollbarReport,
  validateRequestBody,
} from "../../../app/api/util";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";

function makeRequest(): Request {
  return new Request("http://localhost/api/shipment/create_shipment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

const validParsedBody = {
  specialInstructions: "Fragile artwork",
  seller_details: {
    address: {
      address_line: "1 Rue de Rivoli",
      city: "Paris",
      country: "France",
      countryCode: "FR",
      state: "Île-de-France",
      stateCode: "IDF",
      zip: "75001",
    },
    email: "seller@example.com",
    phone: "+33123456789",
    fullname: "Jean Dupont",
  },
  shipment_product_code: "P",
  dimensions: { length: 80, width: 60, height: 5, weight: 3 },
  receiver_address: {
    address_line: "10 Downing Street",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    state: "England",
    stateCode: "ENG",
    zip: "SW1A 2AA",
  },
  receiver_data: {
    email: "buyer@example.com",
    phone: "+447911123456",
    fullname: "John Smith",
  },
  invoice_number: "INV-2026-001",
  artwork_name: "Sunset Over the Seine",
  artwork_price: 5000,
};

const mockDhlShipmentResponse = {
  shipmentTrackingNumber: "1234567890",
  documents: [{ typeCode: "label", content: "base64pdf==" }],
};

describe("POST /api/shipment/create_shipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateRequestBody).mockResolvedValue(validParsedBody);
    vi.mocked(getFutureShipmentDate)
      .mockResolvedValueOnce("2026-05-05T12:00:00")
      .mockResolvedValueOnce("2026-05-02");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDhlShipmentResponse),
      }),
    );
  });

  it("returns 200 with shipment data and planned date on success", async () => {
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data.shipmentTrackingNumber).toBe("1234567890");
    expect(body.data.plannedShippingDateAndTime).toBe("2026-05-05T12:00:00");
  });

  it("marks isCustomsDeclarable true for cross-country shipments", async () => {
    await POST(makeRequest());

    const [, fetchInit] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(fetchInit!.body as string);

    expect(payload.content.isCustomsDeclarable).toBe(true); // FR -> GB
  });

  it("sets receiver contact details correctly in DHL payload", async () => {
    await POST(makeRequest());

    const [, fetchInit] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(fetchInit!.body as string);

    expect(
      payload.customerDetails.receiverDetails.contactInformation.email,
    ).toBe(validParsedBody.receiver_data.email);
    expect(
      payload.customerDetails.receiverDetails.postalAddress.countryCode,
    ).toBe(validParsedBody.receiver_address.countryCode);
  });

  it("returns 500 and calls rollbar when DHL response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "DHL error" }),
      }),
    );

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: create shipment",
      expect.any(Error),
      expect.any(Number),
    );
    expect(body.message).toMatch(/error/i);
  });

  it("returns 500 and calls rollbar on unexpected error", async () => {
    const err = new Error("Network failure");
    vi.mocked(validateRequestBody).mockRejectedValue(err);

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    expect(createErrorRollbarReport).toHaveBeenCalledWith(
      "shipment: create shipment",
      err,
      expect.any(Number),
    );
  });
});
