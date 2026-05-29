import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockCreateUPSShipment } = vi.hoisted(() => ({
  mockCreateUPSShipment: vi.fn(),
}));

vi.mock("../../../app/api/services/ups_service", () => ({
  createUPSShipment: mockCreateUPSShipment,
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/shipment/create_ups_shipment/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TEST_SECRET = "test-internal-secret";

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/shipment/create_ups_shipment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/shipment/create_ups_shipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_SECRET = TEST_SECRET;
  });

  describe("authentication", () => {
    it("returns 401 when x-internal-secret header is missing", async () => {
      const res = await POST(makeRequest({ some: "data" }));
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    });

    it("returns 401 when x-internal-secret header has an incorrect value", async () => {
      const res = await POST(
        makeRequest({ some: "data" }, { "x-internal-secret": "wrong-secret" }),
      );
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    });

    it("returns 401 when x-internal-secret is an empty string", async () => {
      const res = await POST(
        makeRequest({ some: "data" }, { "x-internal-secret": "" }),
      );
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    });
  });

  describe("success", () => {
    it("returns 200 with shipment data when secret is correct", async () => {
      const mockShipmentData = {
        shipmentTrackingNumber: "1Z999AA10123456784",
        estimatedDeliveryDate: "2026-06-05T10:00:00",
        plannedShippingDateAndTime: new Date().toISOString(),
        documents: [{ content: "base64pdfcontent" }],
      };
      mockCreateUPSShipment.mockResolvedValue(mockShipmentData);

      const res = await POST(
        makeRequest(
          { seller_details: { address: { countryCode: "US" } } },
          { "x-internal-secret": TEST_SECRET },
        ),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Shipment created successfully");
      expect(body.data).toEqual(mockShipmentData);
    });

    it("passes the request body directly to createUPSShipment", async () => {
      mockCreateUPSShipment.mockResolvedValue({
        shipmentTrackingNumber: "TRK001",
        estimatedDeliveryDate: null,
        plannedShippingDateAndTime: new Date().toISOString(),
        documents: [],
      });

      const payload = {
        artwork_name: "Test Artwork",
        artwork_price: 500,
        invoice_number: "OMENAI-INV-001",
      };

      await POST(
        makeRequest(payload, { "x-internal-secret": TEST_SECRET }),
      );

      expect(mockCreateUPSShipment).toHaveBeenCalledWith(
        expect.objectContaining(payload),
      );
    });
  });

  describe("error handling", () => {
    it("returns 500 when createUPSShipment throws", async () => {
      mockCreateUPSShipment.mockRejectedValue(
        new Error("UPS API unavailable"),
      );

      const res = await POST(
        makeRequest({ some: "data" }, { "x-internal-secret": TEST_SECRET }),
      );
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.message).toBe("UPS API unavailable");
    });

    it("returns a generic message when the error has no message", async () => {
      mockCreateUPSShipment.mockRejectedValue({});

      const res = await POST(
        makeRequest({ some: "data" }, { "x-internal-secret": TEST_SECRET }),
      );
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.message).toBe("Failed to create UPS shipment");
    });
  });
});
