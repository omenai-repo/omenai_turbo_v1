import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { POST } from "../../../app/api/orders/retrieveOrderLockStatus/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeOrder(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    artwork_data: {
      title: "Test Artwork",
      url: "https://img.test/art.jpg",
      artist: "Test Artist",
      art_id: `art-${uid}`,
      pricing: { usd_price: 1000, shouldShowPrice: "yes" },
      dimensions: { width: 50, height: 70 },
      packaging_type: "rolled",
    },
    buyer_details: { id: `buyer-${uid}`, name: "Test Buyer", email: "buyer@test.com" },
    seller_details: { id: `seller-${uid}`, name: "Test Seller", email: "seller@test.com" },
    seller_designation: "gallery",
    shipping_details: {
      addresses: {
        origin: { city: "NY", countryCode: "US" },
        destination: { city: "London", countryCode: "GB" },
      },
      shipment_information: {
        carrier: "DHL Express",
        tracking: { id: null, status: null },
        quote: { tax_calculation_id: "tax_001" },
      },
    },
    payment_information: { status: "pending" },
    order_accepted: { status: "" },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/retrieveOrderLockStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/orders/retrieveOrderLockStatus (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when order_id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 404 when no order matches the given order_id", async () => {
    const response = await POST(makeRequest({ order_id: "nonexistent-lock-order" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("No order matching this id found");
  });

  it("returns 200 with lock status and artwork_data when order is found", async () => {
    const orderData = makeOrder({ order_id: "order-lock-001" });
    await CreateOrder.create(orderData);

    const response = await POST(makeRequest({ order_id: "order-lock-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toBeDefined();
    expect(body.data.artwork_data).toBeDefined();
  });
});
