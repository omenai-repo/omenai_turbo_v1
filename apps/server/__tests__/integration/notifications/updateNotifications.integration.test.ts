import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { PATCH } from "../../../app/api/notifications/updateNotifications/route";

// ── Environment ───────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.MOBILE_USER_AGENT = "OmenaiApp/1.0";
  process.env.APP_AUTHORIZATION_SECRET = "test-auth-secret";
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeNotification(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    title: "Test Notification",
    body: "This is a test notification body",
    data: {
      type: "orders",
      access_type: "collector",
      metadata: { orderId: `order-${uid}` },
      userId: `user-${uid}`,
    },
    sent: true,
    sentAt: new Date(),
    ...overrides,
  };
}

function makePatchRequest(body: object, authenticated = true): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated) {
    headers["User-Agent"] = "OmenaiApp/1.0";
    headers["Authorization"] = "test-auth-secret";
  }
  return new Request("http://localhost/api/notifications/updateNotifications", {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/notifications/updateNotifications (integration)", () => {
  afterEach(async () => {
    await NotificationHistory.deleteMany({});
    vi.clearAllMocks();
  });

  it("returns 400 when userId is missing from the request body", async () => {
    const response = await PATCH(
      makePatchRequest({
        read: true,
        readAt: new Date().toISOString(),
        access_type: "collector",
        notification_id: "some-id",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 403 when auth headers are missing", async () => {
    const response = await PATCH(
      makePatchRequest(
        {
          read: true,
          readAt: new Date().toISOString(),
          userId: "user-001",
          access_type: "collector",
          notification_id: "some-id",
        },
        false,
      ),
    );

    expect(response.status).toBe(403);
  });

  it("returns 404 when notification_id does not match any document", async () => {
    const response = await PATCH(
      makePatchRequest({
        read: true,
        readAt: new Date().toISOString(),
        userId: "user-001",
        access_type: "collector",
        notification_id: "non-existent-id",
      }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 200 with updated: true after a successful update", async () => {
    const doc = await NotificationHistory.create(
      makeNotification({
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {},
          userId: "user-001",
        },
        read: false,
      }),
    );

    const notification_id = (doc as any).id;

    const response = await PATCH(
      makePatchRequest({
        read: true,
        readAt: new Date().toISOString(),
        userId: "user-001",
        access_type: "collector",
        notification_id,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("Notification updated successfully");
    expect(json.updated).toBe(true);
  });

  it("persists read: true to the database after a successful update", async () => {
    const doc = await NotificationHistory.create(
      makeNotification({
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {},
          userId: "user-001",
        },
        read: false,
      }),
    );

    const notification_id = (doc as any).id;

    await PATCH(
      makePatchRequest({
        read: true,
        readAt: new Date().toISOString(),
        userId: "user-001",
        access_type: "collector",
        notification_id,
      }),
    );

    const updated = await NotificationHistory.findOne({ id: notification_id });

    expect(updated).not.toBeNull();
    expect(updated!.read).toBe(true);
  });
});
