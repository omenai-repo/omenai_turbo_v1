import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { GET } from "../../../app/api/notifications/fetchNotifications/route";

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

function makeGetRequest(
  params: { id?: string; access_type?: string },
  authenticated = true,
): Request {
  const url = new URL("http://localhost/api/notifications/fetchNotifications");
  if (params.id) url.searchParams.set("id", params.id);
  if (params.access_type) url.searchParams.set("access_type", params.access_type);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated) {
    headers["User-Agent"] = "OmenaiApp/1.0";
    headers["Authorization"] = "test-auth-secret";
  }
  return new Request(url.toString(), { method: "GET", headers });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/notifications/fetchNotifications (integration)", () => {
  afterEach(async () => {
    await NotificationHistory.deleteMany({});
    vi.clearAllMocks();
  });

  it("returns 400 when id query param is missing", async () => {
    const response = await GET(makeGetRequest({ access_type: "collector" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when access_type query param is missing", async () => {
    const response = await GET(makeGetRequest({ id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 403 when User-Agent header is absent", async () => {
    const url = new URL("http://localhost/api/notifications/fetchNotifications");
    url.searchParams.set("id", "user-001");
    url.searchParams.set("access_type", "collector");
    const request = new Request(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "test-auth-secret",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("returns 403 when User-Agent is wrong", async () => {
    const url = new URL("http://localhost/api/notifications/fetchNotifications");
    url.searchParams.set("id", "user-001");
    url.searchParams.set("access_type", "collector");
    const request = new Request(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "WrongAgent/2.0",
        Authorization: "test-auth-secret",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("returns 403 when User-Agent is correct but Authorization is wrong", async () => {
    const url = new URL("http://localhost/api/notifications/fetchNotifications");
    url.searchParams.set("id", "user-001");
    url.searchParams.set("access_type", "collector");
    const request = new Request(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OmenaiApp/1.0",
        Authorization: "wrong-secret",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("returns 200 with the 2 notifications that belong to user-001/collector", async () => {
    await NotificationHistory.create([
      makeNotification({ data: { type: "orders", access_type: "collector", metadata: {}, userId: "user-001" } }),
      makeNotification({ data: { type: "wallet", access_type: "collector", metadata: {}, userId: "user-001" } }),
      makeNotification({ data: { type: "orders", access_type: "collector", metadata: {}, userId: "user-002" } }),
    ]);

    const response = await GET(makeGetRequest({ id: "user-001", access_type: "collector" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("Notification history fetched");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data).toHaveLength(2);
  });

  it("does not return notifications belonging to a different user", async () => {
    await NotificationHistory.create([
      makeNotification({ data: { type: "orders", access_type: "collector", metadata: {}, userId: "user-001" } }),
      makeNotification({ data: { type: "orders", access_type: "collector", metadata: {}, userId: "user-002" } }),
    ]);

    const response = await GET(makeGetRequest({ id: "user-001", access_type: "collector" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].data.userId).toBe("user-001");
  });
});
