import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock("@omenai/shared-lib/notifications/sendMobileNotification", () => ({
  pushNotification: vi.fn(),
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
}));

vi.mock("../../../../app/api/workflows/shipment/utils", () => ({
  getMongoClient: vi.fn().mockResolvedValue({}),
}));

import { POST } from "../../../../app/api/workflows/notification/pushNotification/route";
import { pushNotification } from "@omenai/shared-lib/notifications/sendMobileNotification";

const notificationPayload = {
  title: "Order Update",
  body: "Your order has been shipped.",
  data: { order_id: "order-123", type: "shipment" },
  token: "device-token-abc",
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/notification/pushNotification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/notification/pushNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pushNotification).mockResolvedValue({ success: true } as any);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as any);
  });

  it("calls pushNotification with the correct payload", async () => {
    await POST(makeRequest(notificationPayload));

    expect(pushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: notificationPayload.title,
        body: notificationPayload.body,
        data: notificationPayload.data,
      }),
    );
  });

  it("calls the createNotification internal API", async () => {
    await POST(makeRequest(notificationPayload));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/createNotification"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns 500 when createNotification API fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Unauthorized" }),
    } as any);

    const response = await POST(makeRequest(notificationPayload));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });

  it("returns 500 when pushNotification returns success false", async () => {
    vi.mocked(pushNotification).mockResolvedValue({ success: false } as any);

    const response = await POST(makeRequest(notificationPayload));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });

  it("returns 500 when fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const response = await POST(makeRequest(notificationPayload));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBeDefined();
  });
});
