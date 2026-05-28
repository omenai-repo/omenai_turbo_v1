import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockGetDHLTracking, mockGetUPSTracking } = vi.hoisted(() => ({
  mockGetDHLTracking: vi.fn(),
  mockGetUPSTracking: vi.fn(),
}));

const { mockGetLatLng } = vi.hoisted(() => ({
  mockGetLatLng: vi.fn(),
}));

vi.mock("../../../app/api/services/dhl_service", () => ({
  getDHLTracking: mockGetDHLTracking,
}));

vi.mock("../../../app/api/services/ups_service", () => ({
  getUPSTracking: mockGetUPSTracking,
}));

vi.mock("../../../app/api/shipment/resources", () => ({
  getLatLng: mockGetLatLng,
  getDhlHeaders: vi.fn(() => ({})),
  SHIPMENT_API_URL: "https://express.api.dhl.com/mydhlapi/test/shipments",
  DHL_API: "https://express.api.dhl.com/mydhlapi",
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT: "123456789",
}));

import { GET } from "../../../app/api/shipment/shipment_tracking/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeOrder(overrides: Record<string, any> = {}) {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    order_id: `order-${id}`,
    buyer_details: {
      id: `buyer-${id}`,
      name: "Test Buyer",
      email: "buyer@test.com",
    },
    seller_details: {
      id: `seller-${id}`,
      name: "Test Seller",
      email: "seller@test.com",
    },
    seller_designation: "gallery",
    artwork_data: {
      art_id: `art-${id}`,
      title: "Test Artwork",
      url: "img.jpg",
      artist: "Test Artist",
      pricing: { usd_price: 1000 },
    },
    shipping_details: {
      addresses: {
        origin: { city: "New York", countryCode: "US" },
        destination: { city: "London", countryCode: "GB" },
      },
      shipment_information: {
        carrier: "DHL Express",
        tracking: { id: `track-${id}`, status: "In Transit" },
        quote: { tax_calculation_id: "tax_001" },
      },
    },
    payment_information: {
      status: "completed",
      transaction_value: 1000,
      transaction_date: new Date(),
      transaction_reference: "pi_test",
    },
    order_accepted: { status: "accepted" },
    ...overrides,
  };
}

function makeGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/shipment/shipment_tracking");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

const mockDHLTrackingResult = {
  tracking_number: "track-001",
  carrier: "DHL" as const,
  current_status: "IN_TRANSIT" as const,
  estimated_delivery: "2026-06-05T10:00:00",
  events: [
    {
      timestamp: "2026-05-28T08:00:00",
      location: "Chicago Hub",
      description: "Shipment picked up",
      status_label: "IN_TRANSIT" as const,
    },
  ],
};

const mockUPSTrackingResult = {
  tracking_number: "track-002",
  carrier: "UPS" as const,
  current_status: "IN_TRANSIT" as const,
  estimated_delivery: "2026-06-06T12:00:00",
  events: [
    {
      timestamp: "2026-05-28T09:00:00",
      location: "Memphis, TN",
      description: "Package in transit",
      status_label: "IN_TRANSIT" as const,
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/shipment/shipment_tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLatLng.mockResolvedValue({ lat: 40.7128, lng: -74.006 });
  });

  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  describe("validation", () => {
    it("returns 400 when order_id query param is missing", async () => {
      const res = await GET(makeGetRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });

    it("returns 400 when order_id is shorter than 5 characters", async () => {
      const res = await GET(makeGetRequest({ order_id: "abcd" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });

    it("accepts an order_id of exactly 5 characters for validation", async () => {
      // Will fail with 404 (not found), not 400 (validation error)
      const res = await GET(makeGetRequest({ order_id: "abcde" }));
      const body = await res.json();

      expect(res.status).toBe(404);
    });
  });

  describe("not found", () => {
    it("returns 404 when the order does not exist in the database", async () => {
      const res = await GET(
        makeGetRequest({ order_id: "order-nonexistent-id" }),
      );
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/order not found/i);
    });

    it("returns 404 when the order has no tracking id (not yet shipped)", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "New York", countryCode: "US" },
            destination: { city: "London", countryCode: "GB" },
          },
          shipment_information: {
            carrier: "DHL Express",
            tracking: { id: null, status: null },
            quote: { tax_calculation_id: "tax_001" },
          },
        },
      });
      await CreateOrder.create(order);

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/not been shipped/i);
    });
  });

  describe("carrier routing", () => {
    it("calls getDHLTracking for a DHL Express carrier and returns 200", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "Chicago", countryCode: "US" },
            destination: { city: "Paris", countryCode: "FR" },
          },
          shipment_information: {
            carrier: "DHL Express",
            tracking: { id: "dhl-track-123", status: "In Transit" },
            quote: { tax_calculation_id: "tax_002" },
          },
        },
      });
      await CreateOrder.create(order);
      mockGetDHLTracking.mockResolvedValue(mockDHLTrackingResult);

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockGetDHLTracking).toHaveBeenCalledWith("dhl-track-123");
      expect(mockGetUPSTracking).not.toHaveBeenCalled();
    });

    it("calls getUPSTracking for a UPS Ground carrier and returns 200", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "Los Angeles", countryCode: "US" },
            destination: { city: "New York", countryCode: "US" },
          },
          shipment_information: {
            carrier: "UPS Ground",
            tracking: { id: "ups-track-456", status: "In Transit" },
            quote: { tax_calculation_id: "tax_003" },
          },
        },
      });
      await CreateOrder.create(order);
      mockGetUPSTracking.mockResolvedValue(mockUPSTrackingResult);

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockGetUPSTracking).toHaveBeenCalledWith("ups-track-456");
      expect(mockGetDHLTracking).not.toHaveBeenCalled();
    });

    it("returns 400 for an unsupported carrier", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "Houston", countryCode: "US" },
            destination: { city: "Toronto", countryCode: "CA" },
          },
          shipment_information: {
            carrier: "FedEx Priority",
            tracking: { id: "fedex-track-789", status: "In Transit" },
            quote: { tax_calculation_id: "tax_004" },
          },
        },
      });
      await CreateOrder.create(order);

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/unsupported carrier/i);
    });
  });

  describe("response shape", () => {
    it("includes tracking data and coordinates in the response body", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "New York", countryCode: "US" },
            destination: { city: "London", countryCode: "GB" },
          },
          shipment_information: {
            carrier: "DHL Express",
            tracking: { id: "dhl-shape-test", status: "In Transit" },
            quote: { tax_calculation_id: "tax_005" },
          },
        },
      });
      await CreateOrder.create(order);
      mockGetDHLTracking.mockResolvedValue(mockDHLTrackingResult);
      mockGetLatLng
        .mockResolvedValueOnce({ lat: 40.7128, lng: -74.006 })
        .mockResolvedValueOnce({ lat: 51.5074, lng: -0.1278 });

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(body.data).toBeDefined();
      expect(body.data.tracking_number).toBe(
        mockDHLTrackingResult.tracking_number,
      );
      expect(body.data.shipping_details).toBeDefined();
    });

    it("returns coordinates as null when getLatLng throws", async () => {
      const order = makeOrder({
        shipping_details: {
          addresses: {
            origin: { city: "New York", countryCode: "US" },
            destination: { city: "London", countryCode: "GB" },
          },
          shipment_information: {
            carrier: "DHL Express",
            tracking: { id: "dhl-geo-fail", status: "In Transit" },
            quote: { tax_calculation_id: "tax_006" },
          },
        },
      });
      await CreateOrder.create(order);
      mockGetDHLTracking.mockResolvedValue(mockDHLTrackingResult);
      mockGetLatLng.mockRejectedValue(new Error("Geocoding failed"));

      const res = await GET(makeGetRequest({ order_id: order.order_id }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.coordinates).toBeNull();
    });
  });
});
