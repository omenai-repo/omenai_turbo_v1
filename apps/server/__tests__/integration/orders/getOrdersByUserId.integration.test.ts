import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { POST } from "../../../app/api/orders/getOrdersByUserId/route";

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
  return new Request("http://localhost/api/orders/getOrdersByUserId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/orders/getOrdersByUserId (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when id is missing from the request body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 200 with an empty array when no orders exist for the buyer", async () => {
    const response = await POST(makeRequest({ id: "buyer-with-no-orders" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(0);
  });

  it("returns 200 with all orders belonging to the specified buyer", async () => {
    await CreateOrder.create([
      makeOrder({ buyer_details: { id: "buyer-001", name: "Buyer One", email: "b1@test.com" } }),
      makeOrder({ buyer_details: { id: "buyer-001", name: "Buyer One", email: "b1@test.com" } }),
      makeOrder({ buyer_details: { id: "buyer-002", name: "Buyer Two", email: "b2@test.com" } }),
    ]);

    const response = await POST(makeRequest({ id: "buyer-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
  });

  it("does not return orders belonging to a different buyer", async () => {
    await CreateOrder.create([
      makeOrder({ buyer_details: { id: "buyer-001", name: "Buyer One", email: "b1@test.com" } }),
      makeOrder({ buyer_details: { id: "buyer-002", name: "Buyer Two", email: "b2@test.com" } }),
    ]);

    const response = await POST(makeRequest({ id: "buyer-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].buyer_details.id).toBe("buyer-001");
  });
});
