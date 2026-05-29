import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { POST } from "../../../app/api/orders/getSingleOrder/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeOrder(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
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
  return new Request("http://localhost/api/orders/getSingleOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/orders/getSingleOrder (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when order_id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 500 when no order matches the given order_id", async () => {
    const response = await POST(makeRequest({ order_id: "nonexistent-order" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("No order matching this id found");
  });

  it("returns 200 with the order when found by order_id", async () => {
    const orderData = makeOrder({ order_id: "order-abc-123" });
    await CreateOrder.create(orderData);

    const response = await POST(makeRequest({ order_id: "order-abc-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toBeDefined();
    expect(body.data.order_id).toBe("order-abc-123");
  });

  it("returns the order with correct artwork_data.title", async () => {
    const orderData = makeOrder({
      order_id: "order-integrity-check",
      artwork_data: {
        title: "Integrity Test Artwork",
        url: "https://img.test/art.jpg",
        artist: "Test Artist",
        art_id: "art-integrity",
        pricing: { usd_price: 500, shouldShowPrice: "yes" },
        dimensions: { width: 30, height: 40 },
        packaging_type: "rolled",
      },
    });
    await CreateOrder.create(orderData);

    const response = await POST(makeRequest({ order_id: "order-integrity-check" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.artwork_data.title).toBe("Integrity Test Artwork");
  });
});
