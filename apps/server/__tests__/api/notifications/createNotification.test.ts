import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/notifications/NotificationHistorySchema", () => ({
  NotificationHistory: {
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/notifications/createNotification/route";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const validBody = {
  title: "New Order",
  body: "Your order has been confirmed.",
  data: {
    type: "orders",
    access_type: "collector",
    metadata: { orderId: "ord-123" },
    userId: "user-001",
  },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/notifications/createNotification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/notifications/createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(NotificationHistory.create).mockResolvedValue({ _id: "notif-1" } as any);
  });

  it("returns 201 with success message on creation", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Notification record created");
  });

  it("passes title, body, data, and sent:true to NotificationHistory.create", async () => {
    await POST(makeRequest(validBody));

    expect(NotificationHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: validBody.title,
        body: validBody.body,
        data: validBody.data,
        sent: true,
      }),
    );
  });

  it("returns 500 when create returns falsy", async () => {
    vi.mocked(NotificationHistory.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when create throws", async () => {
    vi.mocked(NotificationHistory.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when body has an invalid type enum value", async () => {
    const response = await POST(
      makeRequest({ ...validBody, data: { ...validBody.data, type: "invalid_type" } }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when required fields are missing", async () => {
    const response = await POST(makeRequest({ title: "Test" }));

    expect(response.status).toBe(500);
  });
});
