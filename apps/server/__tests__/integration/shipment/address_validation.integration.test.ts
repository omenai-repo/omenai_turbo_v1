import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockValidateDHLAddress } = vi.hoisted(() => ({
  mockValidateDHLAddress: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  validateDHLAddress: mockValidateDHLAddress,
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/shipment/address_validation/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/shipment/address_validation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/shipment/address_validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation", () => {
    it("returns 400 when type is missing", async () => {
      const res = await POST(
        makeRequest({ countryCode: "US", postalCode: "10001" }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBe("Missing one or more required fields");
    });

    it("returns 400 when countryCode is missing", async () => {
      const res = await POST(
        makeRequest({ type: "pickup", postalCode: "10001" }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBe("Missing one or more required fields");
    });

    it("returns 400 when postalCode is missing", async () => {
      const res = await POST(
        makeRequest({ type: "pickup", countryCode: "US" }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBe("Missing one or more required fields");
    });

    it("returns 400 for an invalid type value", async () => {
      const res = await POST(
        makeRequest({
          type: "pickup_invalid",
          countryCode: "US",
          postalCode: "10001",
        }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBe("Invalid type value");
    });

    it("returns 400 when countryCode is longer than 2 characters", async () => {
      const res = await POST(
        makeRequest({
          type: "pickup",
          countryCode: "USA",
          postalCode: "10001",
        }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBe("Invalid country code");
    });
  });

  describe("success", () => {
    it("returns 200 with data when DHL validation succeeds", async () => {
      const mockData = {
        address: [
          {
            cityName: "New York",
            countryCode: "US",
            postalCode: "10001",
          },
        ],
      };
      mockValidateDHLAddress.mockResolvedValue(mockData);

      const res = await POST(
        makeRequest({
          type: "pickup",
          countryCode: "US",
          postalCode: "10001",
          cityName: "New York",
          countyName: "New York County",
          country: "United States",
        }),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Success");
      expect(body.data).toEqual(mockData);
    });

    it("accepts delivery as a valid type", async () => {
      mockValidateDHLAddress.mockResolvedValue({ address: [] });

      const res = await POST(
        makeRequest({
          type: "delivery",
          countryCode: "GB",
          postalCode: "SW1A1AA",
        }),
      );

      expect(res.status).toBe(200);
    });

    it("calls validateDHLAddress with the correct payload", async () => {
      mockValidateDHLAddress.mockResolvedValue({ address: [] });

      await POST(
        makeRequest({
          type: "pickup",
          countryCode: "NG",
          postalCode: "100001",
          cityName: "Lagos",
          countyName: "Lagos State",
          country: "Nigeria",
        }),
      );

      expect(mockValidateDHLAddress).toHaveBeenCalledWith({
        type: "pickup",
        countryCode: "NG",
        postalCode: "100001",
        cityName: "Lagos",
        countyName: "Lagos State",
        country: "Nigeria",
      });
    });
  });

  describe("error handling", () => {
    it("returns an error response when validateDHLAddress throws", async () => {
      mockValidateDHLAddress.mockRejectedValue(
        Object.assign(new Error("DHL unavailable"), {
          name: "BadRequestError",
          message: "DHL unavailable",
        }),
      );

      const res = await POST(
        makeRequest({
          type: "pickup",
          countryCode: "US",
          postalCode: "10001",
        }),
      );

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
