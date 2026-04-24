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
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    find: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../../../../app/api/services/dhl_service", () => ({
  getDHLTracking: vi.fn(),
}));

vi.mock("../../../../app/api/services/ups_service", () => ({
  getUPSTracking: vi.fn(),
}));

vi.mock(
  "@omenai/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail",
  () => ({
    sendGalleryShipmentSuccessfulMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistFundUnlockEmail",
  () => ({
    sendArtistFundUnlockEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/shipments/checkShipmentDeliveryStatus/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { getDHLTracking } from "../../../../app/api/services/dhl_service";
import { getUPSTracking } from "../../../../app/api/services/ups_service";
import { sendArtistFundUnlockEmail } from "@omenai/shared-emails/src/models/artist/sendArtistFundUnlockEmail";
import { sendGalleryShipmentSuccessfulMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/shipments/checkShipmentDeliveryStatus",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

// Date 2 days in the past to satisfy isDateAtLeastTwoDaysPast
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

const mockDHLTracking = {
  current_status: "DELIVERED",
  events: [{ timestamp: new Date().toISOString(), location: "New York" }],
};

function makeOrder(overrides: Record<string, any> = {}) {
  return {
    order_id: "order-001",
    status: "processing",
    seller_designation: "artist",
    seller_details: {
      id: "artist-001",
      name: "Artist A",
      email: "artist@example.com",
    },
    buyer_details: { name: "Buyer A" },
    payment_information: {
      artist_wallet_increment: 500,
    },
    artwork_data: {
      title: "Artwork 1",
      artist: "Artist A",
      art_id: "art-001",
      url: "https://example.com/art.jpg",
      pricing: { usd_price: 1000 },
    },
    shipping_details: {
      shipment_information: {
        tracking: {
          id: "TRACKING123",
          delivery_status: "In Transit",
        },
        estimates: {
          estimatedDeliveryDate: twoDaysAgo.toISOString(),
        },
        carrier: "DHL Express",
      },
    },
    ...overrides,
  };
}

function makeSession() {
  return {
    withTransaction: vi.fn().mockImplementation(async (fn: () => Promise<any>) => fn()),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
}

describe("GET /api/cron/shipments/checkShipmentDeliveryStatus", () => {
  let mockSession: ReturnType<typeof makeSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = makeSession();
    vi.mocked(connectMongoDB).mockResolvedValue({
      startSession: vi.fn().mockResolvedValue(mockSession),
    } as any);
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    } as any);
    vi.mocked(Wallet.findOne).mockResolvedValue({ _id: "wallet-001" } as any);
    vi.mocked(Wallet.updateOne).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    } as any);
    vi.mocked(getDHLTracking).mockResolvedValue(mockDHLTracking as any);
    vi.mocked(getUPSTracking).mockResolvedValue(null);
  });

  it("returns 200 with no eligible orders when none found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("No orders eligible");
    expect(body.eligible).toBe(0);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("filters out orders whose estimated delivery date is not yet past", async () => {
    const futureOrder = makeOrder({
      shipping_details: {
        shipment_information: {
          tracking: { id: "TRACKING123", delivery_status: "In Transit" },
          estimates: {
            estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          carrier: "DHL Express",
        },
      },
    });
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([futureOrder]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    // When eligibleOrders is empty the route returns a flat response (no summary key)
    expect(body.eligible).toBe(0);
    expect(body.total_processing).toBe(1);
  });

  it("processes a delivered artist order and returns success status", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary.successful_updates).toBe(1);
    expect(body.summary.failed_updates).toBe(0);
  });

  it("updates order status to completed for a delivered order", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);

    await GET(makeRequest());

    expect(CreateOrder.updateOne).toHaveBeenCalledWith(
      { order_id: "order-001", status: "processing" },
      expect.objectContaining({
        $set: expect.objectContaining({ status: "completed" }),
      }),
      expect.anything(),
    );
  });

  it("releases funds to artist wallet on delivery", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);

    await GET(makeRequest());

    expect(Wallet.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: "artist-001" }),
      expect.objectContaining({
        $inc: expect.objectContaining({
          pending_balance: -500,
          available_balance: 500,
        }),
      }),
      expect.anything(),
    );
  });

  it("sends fund unlock email to artist on delivery", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);

    await GET(makeRequest());

    expect(sendArtistFundUnlockEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Artist A",
        email: "artist@example.com",
        amount: 500,
      }),
    );
  });

  it("sends gallery shipment success email for gallery orders", async () => {
    const galleryOrder = makeOrder({
      seller_designation: "gallery",
      seller_details: {
        id: "gallery-001",
        name: "Gallery A",
        email: "gallery@example.com",
      },
      payment_information: {},
    });
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([galleryOrder]),
    } as any);

    await GET(makeRequest());

    expect(sendGalleryShipmentSuccessfulMail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gallery A",
        email: "gallery@example.com",
      }),
    );
  });

  it("skips order when tracking status is not DELIVERED", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);
    vi.mocked(getDHLTracking).mockResolvedValue({
      current_status: "IN_TRANSIT",
      events: [],
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.summary.skipped).toBe(1);
    expect(body.summary.successful_updates).toBe(0);
  });

  it("skips order when tracking service returns null", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);
    vi.mocked(getDHLTracking).mockResolvedValue(null);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.summary.skipped).toBe(1);
  });

  it("uses UPS tracking for UPS carrier orders", async () => {
    const upsOrder = makeOrder({
      shipping_details: {
        shipment_information: {
          tracking: { id: "1Z123", delivery_status: "In Transit" },
          estimates: { estimatedDeliveryDate: twoDaysAgo.toISOString() },
          carrier: "UPS Ground",
        },
      },
    });
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([upsOrder]),
    } as any);
    vi.mocked(getUPSTracking).mockResolvedValue(mockDHLTracking as any);

    await GET(makeRequest());

    expect(getUPSTracking).toHaveBeenCalledWith("1Z123");
  });

  it("includes total_funds_released in summary", async () => {
    const order = makeOrder();
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([order]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(typeof body.summary.total_funds_released).toBe("number");
    expect(body.summary.total_funds_released).toBe(500);
  });

  it("includes execution_time_ms in the response", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    // Flat path when no eligible orders; summary path when orders processed
    const timeMs = body.execution_time_ms ?? body.summary?.execution_time_ms;
    expect(typeof timeMs).toBe("number");
  });

  it("returns error status when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));
    vi.mocked(handleErrorEdgeCases).mockReturnValueOnce({
      status: 403,
      message: "Forbidden",
    });

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB Error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when CreateOrder.find throws", async () => {
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("Query failed")),
    } as any);

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
