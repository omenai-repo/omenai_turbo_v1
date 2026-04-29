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
  NextRequest: class NextRequest extends Request {
    nextUrl: URL;
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input as RequestInfo, init);
      this.nextUrl = new URL(
        typeof input === "string" ? input : (input as Request).url,
      );
    }
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/services/dhl_service", () => ({
  getDHLTracking: vi.fn(),
}));

vi.mock("../../../app/api/services/ups_service", () => ({
  getUPSTracking: vi.fn(),
}));

vi.mock("../../../app/api/shipment/resources", () => ({
  getLatLng: vi.fn(),
}));

import { GET } from "../../../app/api/shipment/shipment_tracking/route";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { getDHLTracking } from "../../../app/api/services/dhl_service";
import { getUPSTracking } from "../../../app/api/services/ups_service";
import { getLatLng } from "../../../app/api/shipment/resources";

function makeRequest(orderId?: string): Request {
  const url = new URL("http://localhost/api/shipment/shipment_tracking");
  if (orderId) url.searchParams.set("order_id", orderId);
  return new Request(url.toString(), { method: "GET" });
}

const mockOrder = {
  order_id: "ORD-12345",
  shipping_details: {
    shipment_information: {
      tracking: { id: "DHL-TRACK-001" },
      carrier: "DHL Express",
    },
    addresses: {
      origin: { city: "Paris", countryCode: "FR" },
      destination: { city: "London", countryCode: "GB" },
    },
  },
};

const mockDhlTrackingResult = {
  status: "in-transit",
  estimatedDelivery: "2026-05-10",
  events: [{ timestamp: "2026-05-05T10:00:00", description: "Departed" }],
};

const mockCoordinates = {
  origin: { lat: 48.8566, lng: 2.3522 },
  destination: { lat: 51.5074, lng: -0.1278 },
};

describe("GET /api/shipment/shipment_tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue(undefined);
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: () => Promise.resolve(mockOrder),
    } as any);
    vi.mocked(getDHLTracking).mockResolvedValue(mockDhlTrackingResult as any);
    vi.mocked(getLatLng)
      .mockResolvedValueOnce(mockCoordinates.origin)
      .mockResolvedValueOnce(mockCoordinates.destination);
  });

  it("returns 200 with tracking data and coordinates for DHL shipment", async () => {
    const response = await GET(makeRequest("ORD-12345"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("in-transit");
    expect(body.data.coordinates.origin).toEqual(mockCoordinates.origin);
    expect(body.data.coordinates.destination).toEqual(
      mockCoordinates.destination,
    );
    expect(body.data.shipping_details).toEqual(mockOrder.shipping_details);
  });

  it("calls getDHLTracking with the order tracking id", async () => {
    await GET(makeRequest("ORD-12345"));

    expect(getDHLTracking).toHaveBeenCalledWith("DHL-TRACK-001");
    expect(getUPSTracking).not.toHaveBeenCalled();
  });

  it("calls getUPSTracking for UPS shipments", async () => {
    const upsOrder = {
      ...mockOrder,
      shipping_details: {
        ...mockOrder.shipping_details,
        shipment_information: {
          tracking: { id: "UPS-TRACK-001" },
          carrier: "UPS Ground",
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: () => Promise.resolve(upsOrder),
    } as any);
    vi.mocked(getUPSTracking).mockResolvedValue(mockDhlTrackingResult as any);

    const response = await GET(makeRequest("ORD-12345"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getUPSTracking).toHaveBeenCalledWith("UPS-TRACK-001");
    expect(getDHLTracking).not.toHaveBeenCalled();
  });

  it("returns 500 with error message when order_id is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it("returns error when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: () => Promise.resolve(null),
    } as any);

    const response = await GET(makeRequest("ORD-NOTFOUND"));
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toMatch(/order not found/i);
  });

  it("returns error when order has no tracking id", async () => {
    const unshippedOrder = {
      ...mockOrder,
      shipping_details: {
        ...mockOrder.shipping_details,
        shipment_information: {
          tracking: { id: null },
          carrier: "DHL Express",
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: () => Promise.resolve(unshippedOrder),
    } as any);

    const response = await GET(makeRequest("ORD-12345"));
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toMatch(/not been shipped/i);
  });

  it("still returns tracking data when geocoding fails", async () => {
    vi.mocked(getLatLng).mockReset();
    vi.mocked(getLatLng).mockRejectedValue(new Error("Geocoding unavailable"));

    const response = await GET(makeRequest("ORD-12345"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.coordinates).toBeNull();
  });
});
