import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  Subscriptions: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/device_management/DeviceManagementSchema", () => ({
  DeviceManagement: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    tax: {
      calculations: { create: vi.fn() },
    },
  },
}));

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/orders/orderAcceptedMail", () => ({
  sendOrderAcceptedMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("42"),
}));

vi.mock("../../../app/api/services/ups_service", () => ({
  getUPSRates: vi.fn(),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/accept_order_request/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { getShipmentRates } from "../../../app/api/util";
import { getUPSRates } from "../../../app/api/services/ups_service";
import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";

const nonUsAddress = { address_line: "1 Test St", city: "Berlin", state: "Berlin", stateCode: "BE", country: "DE", countryCode: "DE", zip: "10115" };
const usAddress = { address_line: "100 Main", city: "LA", state: "CA", stateCode: "CA", country: "US", countryCode: "US", zip: "90001" };

const mockDHLOrder = {
  order_id: "order-abc",
  seller_designation: "artist",
  seller_details: { id: "artist-1" },
  buyer_details: { id: "user-1", name: "John", email: "buyer@test.com" },
  artwork_data: { title: "Test Art", pricing: { usd_price: 500 } },
  shipping_details: {
    shipment_information: { carrier: "DHL" },
    addresses: { origin: nonUsAddress, destination: nonUsAddress },
  },
};

const mockUPSOrder = {
  ...mockDHLOrder,
  shipping_details: {
    shipment_information: { carrier: "UPS" },
    addresses: { origin: usAddress, destination: usAddress },
  },
};

const validBody = {
  order_id: "order-abc",
  dimensions: { length: 30, width: 20, height: 10, weight: 5 },
  exhibition_status: null,
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/accept_order_request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/accept_order_request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockDHLOrder as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(getShipmentRates).mockResolvedValue({
      productName: "Express Worldwide",
      productCode: "P",
      chargeable_price_in_usd: "80",
    } as any);
    vi.mocked(DeviceManagement.findOne).mockResolvedValue(null);
  });

  it("returns 200 when artist order accepted via DHL", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Order successfully accepted.");
    expect(getShipmentRates).toHaveBeenCalled();
    expect(sendOrderAcceptedMail).toHaveBeenCalled();
  });

  it("returns 200 when order accepted via UPS for domestic shipment", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockUPSOrder as any);
    vi.mocked(getUPSRates).mockResolvedValue({
      productName: "UPS Ground",
      productCode: "03",
      chargeable_price_in_usd: "50",
    } as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(getUPSRates).toHaveBeenCalled();
  });

  it("returns 404 when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Order data not found/i);
  });

  it("returns 403 when gallery seller has no active subscription", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue({
      ...mockDHLOrder,
      seller_designation: "gallery",
      seller_details: { id: "gallery-1" },
    } as any);
    vi.mocked(Subscriptions.findOne).mockResolvedValue({ status: "inactive" } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/subscription/i);
  });

  it("returns 200 when gallery seller has active subscription", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue({
      ...mockDHLOrder,
      seller_designation: "gallery",
      seller_details: { id: "gallery-1" },
    } as any);
    vi.mocked(Subscriptions.findOne).mockResolvedValue({ status: "active" } as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(
      makeRequest({ dimensions: { length: 30, width: 20, height: 10, weight: 5 }, exhibition_status: null }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when dimensions are missing", async () => {
    const response = await POST(makeRequest({ order_id: "order-abc", exhibition_status: null }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
