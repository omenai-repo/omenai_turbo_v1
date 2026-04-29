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
    updateOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { PATCH } from "../../../app/api/notifications/updateNotifications/route";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const MOBILE_USER_AGENT = "omenai-mobile/1.0";
const APP_AUTH_SECRET = "super-secret-token";

const validBody = {
  read: true,
  readAt: "2024-04-28T10:00:00.000Z",
  userId: "user-001",
  access_type: "collector",
  notification_id: "notif-abc",
};

function makeRequest(body: object, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/notifications/updateNotifications", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": MOBILE_USER_AGENT,
      Authorization: APP_AUTH_SECRET,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/notifications/updateNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MOBILE_USER_AGENT = MOBILE_USER_AGENT;
    process.env.APP_AUTHORIZATION_SECRET = APP_AUTH_SECRET;
    vi.mocked(NotificationHistory.updateOne).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 with updated:true when notification is modified", async () => {
    const response = await PATCH(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Notification updated successfully");
    expect(body.updated).toBe(true);
  });

  it("returns 200 with updated:false when matched but not modified", async () => {
    vi.mocked(NotificationHistory.updateOne).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 0,
    } as any);

    const response = await PATCH(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.updated).toBe(false);
  });

  it("calls updateOne with correct filter and $set updates", async () => {
    await PATCH(makeRequest(validBody));

    expect(NotificationHistory.updateOne).toHaveBeenCalledWith(
      {
        "data.userId": "user-001",
        "data.access_type": "collector",
        id: "notif-abc",
      },
      expect.objectContaining({ $set: expect.objectContaining({ read: true }) }),
    );
  });

  it("excludes userId, access_type, and notification_id from $set updates", async () => {
    await PATCH(makeRequest(validBody));

    const [, update] = vi.mocked(NotificationHistory.updateOne).mock.calls[0];
    expect((update as any).$set).not.toHaveProperty("userId");
    expect((update as any).$set).not.toHaveProperty("access_type");
    expect((update as any).$set).not.toHaveProperty("notification_id");
  });

  it("returns 403 when User-Agent header is missing", async () => {
    const response = await PATCH(
      makeRequest(validBody, { "User-Agent": "" }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when Authorization header does not match", async () => {
    const response = await PATCH(
      makeRequest(validBody, { Authorization: "wrong-secret" }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 404 when no notification matches the filter", async () => {
    vi.mocked(NotificationHistory.updateOne).mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
    } as any);

    const response = await PATCH(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(404);
  });

  it("returns 500 when updateOne throws", async () => {
    vi.mocked(NotificationHistory.updateOne).mockRejectedValue(new Error("DB error"));

    const response = await PATCH(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await PATCH(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 500 when body is missing required fields", async () => {
    const response = await PATCH(makeRequest({ read: true }));

    expect(response.status).toBe(500);
  });
});
