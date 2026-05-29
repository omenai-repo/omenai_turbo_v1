import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { POST } from "../../../app/api/orders/updateOrderLockStatus/route";

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
  return new Request("http://localhost/api/orders/updateOrderLockStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/orders/updateOrderLockStatus (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when art_id is missing from the request body", async () => {
    const response = await POST(makeRequest({ lock_status: "locked" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when lock_status is missing from the request body", async () => {
    const response = await POST(makeRequest({ art_id: "art-xyz" }));

    expect(response.status).toBe(400);
  });

  it("returns 200 when no orders match the art_id (updateMany matches 0 documents)", async () => {
    const response = await POST(
      makeRequest({ art_id: "art-nonexistent", lock_status: "locked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
  });

  it("returns 200 and updates lock_purchase in the database for matching orders", async () => {
    const orderData = makeOrder({
      artwork_data: {
        title: "Lockable Art",
        url: "https://img.test/art.jpg",
        artist: "Test Artist",
        art_id: "art-lock-target",
        pricing: { usd_price: 1000, shouldShowPrice: "yes" },
        dimensions: { width: 50, height: 70 },
        packaging_type: "rolled",
      },
      lock_purchase: "unlocked",
    });
    await CreateOrder.create(orderData);

    const response = await POST(
      makeRequest({ art_id: "art-lock-target", lock_status: "locked" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");

    const updatedOrder = await CreateOrder.findOne({
      "artwork_data.art_id": "art-lock-target",
    }).lean();
    expect((updatedOrder as any).lock_purchase).toBe("locked");
  });
});
