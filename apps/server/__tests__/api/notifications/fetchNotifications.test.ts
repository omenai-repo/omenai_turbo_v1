import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/notifications/NotificationHistorySchema", () => ({
  NotificationHistory: {
    find: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/notifications/fetchNotifications/route";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { validateGetRouteParams } from "../../../app/api/util";

const MOBILE_USER_AGENT = "omenai-mobile/1.0";
const APP_AUTH_SECRET = "super-secret-token";

const mockNotifications = [
  { _id: "n-1", title: "Order Update", data: { userId: "user-001" } },
  { _id: "n-2", title: "Wallet Credit", data: { userId: "user-001" } },
];

function makeRequest(
  params: { id?: string; access_type?: string } = {},
  headers: Record<string, string> = {},
): Request {
  const url = new URL("http://localhost/api/notifications/fetchNotifications");
  if (params.id) url.searchParams.set("id", params.id);
  if (params.access_type) url.searchParams.set("access_type", params.access_type);
  return new Request(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": MOBILE_USER_AGENT,
      Authorization: APP_AUTH_SECRET,
      ...headers,
    },
  });
}

describe("GET /api/notifications/fetchNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MOBILE_USER_AGENT = MOBILE_USER_AGENT;
    process.env.APP_AUTHORIZATION_SECRET = APP_AUTH_SECRET;
    vi.mocked(NotificationHistory.find).mockResolvedValue(mockNotifications as any);
    vi.mocked(validateGetRouteParams).mockImplementation((schema: any, data: any) => {
      const result = schema.safeParse(data);
      if (!result.success)
        throw Object.assign(new Error("Invalid URL parameters"), {
          name: "BadRequestError",
        });
      return data;
    });
  });

  it("returns 200 with notification history on success", async () => {
    const response = await GET(makeRequest({ id: "user-001", access_type: "collector" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Notification history fetched");
    expect(body.data).toEqual(mockNotifications);
  });

  it("queries NotificationHistory by access_type and userId", async () => {
    await GET(makeRequest({ id: "user-001", access_type: "gallery" }));

    expect(NotificationHistory.find).toHaveBeenCalledWith({
      "data.access_type": "gallery",
      "data.userId": "user-001",
    });
  });

  it("returns 403 when User-Agent header is missing", async () => {
    const response = await GET(
      makeRequest(
        { id: "user-001", access_type: "collector" },
        { "User-Agent": "" },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when Authorization header is missing", async () => {
    const response = await GET(
      makeRequest(
        { id: "user-001", access_type: "collector" },
        { Authorization: "" },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when User-Agent does not match env var", async () => {
    const response = await GET(
      makeRequest(
        { id: "user-001", access_type: "collector" },
        { "User-Agent": "wrong-agent" },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest({ access_type: "collector" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when access_type param is missing", async () => {
    const response = await GET(makeRequest({ id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when NotificationHistory.find throws", async () => {
    vi.mocked(NotificationHistory.find).mockRejectedValue(new Error("DB error"));

    const response = await GET(makeRequest({ id: "user-001", access_type: "collector" }));

    expect(response.status).toBe(500);
  });
});
