import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/crons/FailedJob", () => ({
  FailedJob: { deleteOne: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@omenai/shared-models/models/lock/LockSchema", () => ({
  LockMechanism: { deleteOne: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@omenai/shared-models/models/orders/OrderWaybillCache", () => ({
  WaybillCache: {
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({}),
    updateOne: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@omenai/shared-models/models/orders/CreateShipmentSchedule", () => ({
  ScheduledShipment: {
    updateOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail",
  () => ({
    sendShipmentScheduledEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn((p: number) => `$${p}`),
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
  tracking_url: vi.fn().mockReturnValue("http://localhost/tracking"),
}));

vi.mock("../../../../app/api/workflows/shipment/utils", () => ({
  SHIPMENT_API_URL: "http://localhost/api/shipment/create_shipment",
  UPS_SHIPMENT_API_URL: "http://localhost/api/shipment/create_ups_shipment",
  getMongoClient: vi.fn(),
  buildShipmentData: vi.fn(),
  handleWaybillUpload: vi.fn().mockResolvedValue("https://waybill-url"),
  handleWorkflowError: vi
    .fn()
    .mockRejectedValue(new Error("RetryableError: workflow error")),
  sendShipmentEmailWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/workflows/shipment/create_shipment/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { WaybillCache } from "@omenai/shared-models/models/orders/OrderWaybillCache";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";
import {
  getMongoClient,
  buildShipmentData,
  handleWaybillUpload,
  sendShipmentEmailWorkflow,
} from "../../../../app/api/workflows/shipment/utils";

const baseOrder = {
  order_id: "order-abc",
  buyer_details: {
    id: "buyer-1",
    name: "John",
    email: "buyer@test.com",
    phone: "+1234",
  },
  seller_details: {
    id: "seller-1",
    name: "Jane",
    email: "seller@test.com",
    phone: "+5678",
  },
  artwork_data: {
    title: "Test Art",
    art_id: "art-1",
    url: "https://img.test/art.jpg",
    artist: "Jane Artist",
    pricing: { usd_price: 500 },
  },
  shipping_details: {
    additional_information: null,
    addresses: {
      origin: {
        address_line: "1 Origin St",
        city: "Paris",
        country: "FR",
        countryCode: "FR",
        zip: "75001",
      },
      destination: {
        address_line: "1 Dest St",
        city: "Berlin",
        country: "DE",
        countryCode: "DE",
        zip: "10115",
      },
    },
    shipment_information: {
      carrier: "DHL Express",
      tracking: { id: null, link: null, delivery_status: null },
      waybill_document: null,
      shipment_product_code: "P",
      dimensions: { length: 30, width: 20, height: 10, weight: 5 },
    },
  },
  exhibition_status: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockSession = {
  startTransaction: vi.fn(),
  commitTransaction: vi.fn().mockResolvedValue(undefined),
  abortTransaction: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn().mockResolvedValue(undefined),
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/shipment/create_shipment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/shipment/create_shipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMongoClient).mockResolvedValue({
      startSession: vi.fn().mockReturnValue(mockSession),
    } as any);
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(baseOrder),
    } as any);
    vi.mocked(CreateOrder.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);
    vi.mocked(ScheduledShipment.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);
    vi.mocked(buildShipmentData).mockReturnValue({
      artwork_name: "Test Art",
      carrier: "DHL Express",
      seller_details: { fullname: "Jane", email: "seller@test.com" },
      receiver_data: { fullname: "John", email: "buyer@test.com" },
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          shipmentTrackingNumber: "TRK-123",
          estimatedDeliveryDate: "2025-02-01",
          plannedShippingDateAndTime: "2025-01-28",
          documents: [{ content: "base64pdfcontent" }],
        },
      }),
    } as any);
  });

  it("returns 500 and calls handleWorkflowError when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ order_id: "order-abc" }));

    expect(response.status).toBe(500);
  });

  it("cleans up the lock mechanism for the buyer and artwork", async () => {
    const orderWithTracking = {
      ...baseOrder,
      shipping_details: {
        ...baseOrder.shipping_details,
        shipment_information: {
          ...baseOrder.shipping_details.shipment_information,
          tracking: {
            id: "TRK-DONE",
            link: "https://track",
            delivery_status: "delivered",
          },
          waybill_document: "https://waybill-url",
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(orderWithTracking),
    } as any);

    await POST(makeRequest({ order_id: "order-abc" }));

    expect(LockMechanism.deleteOne).toHaveBeenCalledWith({
      user_id: baseOrder.buyer_details.id,
      art_id: baseOrder.artwork_data.art_id,
    });
  });

  it("ALREADY_COMPLETED: cleans up failed job and waybill cache", async () => {
    const completedOrder = {
      ...baseOrder,
      shipping_details: {
        ...baseOrder.shipping_details,
        shipment_information: {
          ...baseOrder.shipping_details.shipment_information,
          tracking: {
            id: "TRK-DONE",
            link: "https://track",
            delivery_status: "delivered",
          },
          waybill_document: "https://waybill-url",
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(completedOrder),
    } as any);

    await POST(makeRequest({ order_id: "order-abc" }));

    expect(FailedJob.deleteOne).toHaveBeenCalledWith({
      jobId: "order-abc",
      jobType: "create_shipment",
    });
    expect(WaybillCache.deleteOne).toHaveBeenCalled();
  });

  it("RECOVER_WAYBILL: fetches cached waybill and calls handleWaybillUpload", async () => {
    const trackingOnlyOrder = {
      ...baseOrder,
      shipping_details: {
        ...baseOrder.shipping_details,
        shipment_information: {
          ...baseOrder.shipping_details.shipment_information,
          tracking: { id: "TRK-123", link: null, delivery_status: null },
          waybill_document: null,
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(trackingOnlyOrder),
    } as any);
    vi.mocked(WaybillCache.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ pdf_base64: "base64content" }),
    } as any);

    await POST(makeRequest({ order_id: "order-abc" }));

    expect(handleWaybillUpload).toHaveBeenCalledWith(
      "base64content",
      "order-abc",
    );
  });

  it("RECOVER_WAYBILL: returns 500 when waybill cache is missing", async () => {
    const trackingOnlyOrder = {
      ...baseOrder,
      shipping_details: {
        ...baseOrder.shipping_details,
        shipment_information: {
          ...baseOrder.shipping_details.shipment_information,
          tracking: { id: "TRK-123", link: null, delivery_status: null },
          waybill_document: null,
        },
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(trackingOnlyOrder),
    } as any);
    vi.mocked(WaybillCache.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ order_id: "order-abc" }));

    expect(response.status).toBe(500);
  });

  it("SCHEDULE_SHIPMENT: schedules when exhibition is pending", async () => {
    const exhibitionOrder = {
      ...baseOrder,
      exhibition_status: {
        status: "pending",
        exhibition_end_date: new Date("2025-06-01"),
      },
    };
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(exhibitionOrder),
    } as any);

    await POST(makeRequest({ order_id: "order-abc" }));

    expect(ScheduledShipment.updateOne).toHaveBeenCalledWith(
      { order_id: "order-abc" },
      expect.objectContaining({
        $set: expect.objectContaining({ order_id: "order-abc" }),
      }),
      { upsert: true },
    );
    expect(sendShipmentScheduledEmail).toHaveBeenCalled();
  });

  it("CREATE_SHIPMENT: calls the shipment API and stores tracking info", async () => {
    await POST(makeRequest({ order_id: "order-abc" }));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/shipment"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(CreateOrder.updateOne).toHaveBeenCalledWith(
      { order_id: "order-abc" },
      expect.objectContaining({
        $set: expect.objectContaining({
          "shipping_details.shipment_information.tracking.id": "TRK-123",
        }),
      }),
    );
    expect(sendShipmentEmailWorkflow).toHaveBeenCalled();
  });

  it("CREATE_SHIPMENT: returns 500 when shipment API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Shipment creation failed" }),
    } as any);

    const response = await POST(makeRequest({ order_id: "order-abc" }));

    expect(response.status).toBe(500);
  });
});
