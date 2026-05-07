import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock(
  "@omenai/shared-models/models/orders/CreateShipmentSchedule",
  () => ({
    ScheduledShipment: {
      find: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue("workflow-id-001"),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("42"),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn().mockReturnValue("$100.00"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/shipment/sendShipmentPickupReminderMail",
  () => ({
    sendShipmentPickupReminderMail: vi.fn().mockResolvedValue(undefined),
  }),
);

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

vi.mock(
  "../../../../custom/errors/dictionary/errorDictionary",
  () => ({
    BadRequestError: class BadRequestError extends Error {},
    ServerError: class ServerError extends Error {},
  }),
);

import { GET } from "../../../../app/api/cron/shipments/createShipmentAtExhibitionEndDate/route";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendShipmentPickupReminderMail } from "@omenai/shared-emails/src/models/shipment/sendShipmentPickupReminderMail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/shipments/createShipmentAtExhibitionEndDate",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const mockOrder = {
  order_id: "order-001",
  seller_details: {
    name: "Seller A",
    email: "seller@example.com",
  },
  buyer_details: { name: "Buyer A" },
  artwork_data: {
    title: "Artwork 1",
    artist: "Artist A",
    art_id: "art-001",
    url: "https://example.com/art.jpg",
    pricing: { usd_price: 1000 },
  },
  shipping_details: {
    addresses: {
      origin: { city: "New York", country: "US" },
    },
    shipment_information: {
      planned_shipping_date: tomorrow.toISOString(),
    },
  },
  createdAt: yesterday.toISOString(),
};

describe("GET /api/cron/shipments/createShipmentAtExhibitionEndDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(ScheduledShipment.find).mockResolvedValue([] as any);
    vi.mocked(ScheduledShipment.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockOrder as any);
    vi.mocked(createWorkflow).mockResolvedValue("workflow-id-001");
  });

  it("returns 200 with no scheduled shipments message when none found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No scheduled shipments.");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("queries ScheduledShipment for scheduled status", async () => {
    await GET(makeRequest());
    expect(ScheduledShipment.find).toHaveBeenCalledWith({ status: "scheduled" });
  });

  it("returns 200 with shipments created count when shipments processed", async () => {
    const pastShipment = {
      order_id: "order-001",
      executeAt: yesterday,
      reminderSent: false,
      status: "scheduled",
    };
    vi.mocked(ScheduledShipment.find).mockResolvedValue(
      [pastShipment] as any,
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Scheduled shipment batch check completed.");
    expect(body.shipmentsCreated).toBe(1);
  });

  it("triggers shipment workflow when executeAt is in the past", async () => {
    const pastShipment = {
      order_id: "order-001",
      executeAt: yesterday,
      reminderSent: false,
      status: "scheduled",
    };
    vi.mocked(ScheduledShipment.find).mockResolvedValue(
      [pastShipment] as any,
    );

    await GET(makeRequest());

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/shipment/create_shipment",
      expect.stringContaining("create_shipment"),
      JSON.stringify({ order_id: "order-001" }),
    );
  });

  it("updates shipment status to resolved when triggering workflow", async () => {
    const pastShipment = {
      order_id: "order-001",
      executeAt: yesterday,
      reminderSent: false,
      status: "scheduled",
    };
    vi.mocked(ScheduledShipment.find).mockResolvedValue(
      [pastShipment] as any,
    );

    await GET(makeRequest());

    expect(ScheduledShipment.updateOne).toHaveBeenCalledWith(
      { order_id: "order-001" },
      { $set: { status: "resolved" } },
    );
  });

  it("sends reminder email when within 2 days of executeAt and not reminded", async () => {
    const soonShipment = {
      order_id: "order-001",
      executeAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12h from now
      reminderSent: false,
      status: "scheduled",
    };
    vi.mocked(ScheduledShipment.find).mockResolvedValue(
      [soonShipment] as any,
    );

    await GET(makeRequest());

    expect(sendShipmentPickupReminderMail).toHaveBeenCalled();
  });

  it("skips reminder email when already reminded", async () => {
    const remindedShipment = {
      order_id: "order-001",
      executeAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      reminderSent: true,
      status: "scheduled",
    };
    vi.mocked(ScheduledShipment.find).mockResolvedValue(
      [remindedShipment] as any,
    );

    await GET(makeRequest());

    expect(sendShipmentPickupReminderMail).not.toHaveBeenCalled();
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
});
