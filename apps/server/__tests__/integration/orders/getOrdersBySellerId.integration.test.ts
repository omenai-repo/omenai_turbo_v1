import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { GET } from "../../../app/api/orders/getOrdersBySellerId/route";

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

function makeGetRequest(sellerId?: string): Request {
  const url = new URL("http://localhost/api/orders/getOrdersBySellerId");
  if (sellerId) url.searchParams.set("id", sellerId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/orders/getOrdersBySellerId (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when the id query param is missing", async () => {
    const response = await GET(makeGetRequest() as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });

  it("returns 200 with an empty array when no orders exist for the seller", async () => {
    const response = await GET(makeGetRequest("seller-with-no-orders") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(0);
  });

  it("returns 200 with all orders belonging to the specified seller", async () => {
    await CreateOrder.create([
      makeOrder({ seller_details: { id: "seller-001", name: "Seller One", email: "s1@test.com" } }),
      makeOrder({ seller_details: { id: "seller-001", name: "Seller One", email: "s1@test.com" } }),
      makeOrder({ seller_details: { id: "seller-002", name: "Seller Two", email: "s2@test.com" } }),
    ]);

    const response = await GET(makeGetRequest("seller-001") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
  });

  it("does not return orders belonging to a different seller", async () => {
    await CreateOrder.create([
      makeOrder({ seller_details: { id: "seller-001", name: "Seller One", email: "s1@test.com" } }),
      makeOrder({ seller_details: { id: "seller-002", name: "Seller Two", email: "s2@test.com" } }),
    ]);

    const response = await GET(makeGetRequest("seller-002") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].seller_details.id).toBe("seller-002");
  });
});
