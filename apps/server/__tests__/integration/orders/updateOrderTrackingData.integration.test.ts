import { describe, it, expect, afterEach } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { POST } from "../../../app/api/orders/updateOrderTrackingData/route";

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
  return new Request("http://localhost/api/orders/updateOrderTrackingData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/orders/updateOrderTrackingData (integration)", () => {
  afterEach(async () => {
    await CreateOrder.deleteMany({});
  });

  it("returns 400 when order_id is missing from the request body", async () => {
    const response = await POST(
      makeRequest({ data: { id: "TRACK123", status: "in_transit" } }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when data is missing from the request body", async () => {
    const response = await POST(makeRequest({ order_id: "order-tracking-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when no order matches the given order_id", async () => {
    const response = await POST(
      makeRequest({
        order_id: "order-does-not-exist",
        data: { id: "TRACK999", status: "in_transit" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Tracking data could not be updated");
  });

  it("returns 200 with success message when tracking data is updated", async () => {
    const orderData = makeOrder({ order_id: "order-tracking-update-001" });
    await CreateOrder.create(orderData);

    const response = await POST(
      makeRequest({
        order_id: "order-tracking-update-001",
        data: { id: "TRACK-ABC-001", status: "in_transit" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully updated tracking information");
  });

  it("persists the updated tracking data in the database", async () => {
    const orderData = makeOrder({ order_id: "order-tracking-persist-001" });
    await CreateOrder.create(orderData);

    await POST(
      makeRequest({
        order_id: "order-tracking-persist-001",
        data: { id: "TRACK-PERSIST-XYZ", status: "delivered" },
      }),
    );

    const updatedOrder = await CreateOrder.findOne({
      order_id: "order-tracking-persist-001",
    }).lean();

    const tracking = (updatedOrder as any).shipping_details.shipment_information.tracking;
    expect(tracking.id).toBe("TRACK-PERSIST-XYZ");
    expect(tracking.status).toBe("delivered");
  });
});
