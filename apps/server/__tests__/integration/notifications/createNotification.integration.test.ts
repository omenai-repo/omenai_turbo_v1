import { describe, it, expect, afterEach, vi } from "vitest";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { POST } from "../../../app/api/notifications/createNotification/route";

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

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/notifications/createNotification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/notifications/createNotification (integration)", () => {
  afterEach(async () => {
    await NotificationHistory.deleteMany({});
    vi.clearAllMocks();
  });

  it("returns 400 when title is missing", async () => {
    const { title: _omit, ...bodyWithoutTitle } = makeNotification();
    const response = await POST(makeRequest(bodyWithoutTitle));

    expect(response.status).toBe(400);
  });

  it("returns 400 when data.type is not a valid enum value", async () => {
    const body = makeNotification({
      data: {
        type: "invalid_type",
        access_type: "collector",
        metadata: {},
        userId: "user-001",
      },
    });
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
  });

  it("returns 400 when data.access_type is not a valid enum value", async () => {
    const body = makeNotification({
      data: {
        type: "orders",
        access_type: "invalid_access",
        metadata: {},
        userId: "user-001",
      },
    });
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
  });

  it("returns 201 with correct message on valid body", async () => {
    const response = await POST(makeRequest(makeNotification()));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.message).toBe("Notification record created");
  });

  it("persists the notification to the database after a successful request", async () => {
    await POST(makeRequest(makeNotification({ title: "Test Notification" })));

    const doc = await NotificationHistory.findOne({ title: "Test Notification" });

    expect(doc).not.toBeNull();
    expect(doc!.title).toBe("Test Notification");
  });
});
