import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/support/SupportTicketSchema", () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return {
    ...buildValidateRequestBodyMock(),
    getSessionData: vi.fn(),
  };
});

import { POST } from "../../../app/api/support/route";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

const validBody = {
  category: "GENERAL",
  message: "I need help with my account.",
  pageUrl: "https://app.omenai.co/dashboard",
  userEmail: "guest@example.com",
};

function makeRequest(body: object, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SupportTicket.create).mockResolvedValue({} as any);
  });

  it("returns 200 with ticket created for guest user", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Ticket created");
    expect(body.ticketId).toMatch(/^OM_TICKET_\d+$/);
  });

  it("creates ticket with GUEST userType when no session data", async () => {
    await POST(makeRequest(validBody));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userType: "GUEST",
        userEmail: validBody.userEmail,
        userId: null,
        status: "OPEN",
      }),
    );
  });

  it("creates ticket with GALLERY userType when session data is present", async () => {
    const sessionData = {
      userData: { id: "gallery-123", email: "gallery@test.com", role: "gallery" },
      csrfToken: "csrf-token",
    };
    await POST(makeRequest(validBody), undefined as any, sessionData as any);

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userType: "GALLERY",
        userEmail: "gallery@test.com",
        userId: "gallery-123",
      }),
    );
  });

  it("assigns HIGH priority to PAYMENT category", async () => {
    await POST(makeRequest({ ...validBody, category: "PAYMENT" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "HIGH" }),
    );
  });

  it("assigns HIGH priority to PAYOUT category", async () => {
    await POST(makeRequest({ ...validBody, category: "PAYOUT" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "HIGH" }),
    );
  });

  it("assigns HIGH priority to WALLET category", async () => {
    await POST(makeRequest({ ...validBody, category: "WALLET" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "HIGH" }),
    );
  });

  it("assigns HIGH priority to UPLOAD_ISSUE category", async () => {
    await POST(makeRequest({ ...validBody, category: "UPLOAD_ISSUE" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "HIGH" }),
    );
  });

  it("assigns NORMAL priority to non-critical categories", async () => {
    await POST(makeRequest({ ...validBody, category: "GENERAL" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "NORMAL" }),
    );
  });

  it("includes browser user-agent in ticket meta", async () => {
    await POST(makeRequest(validBody, { "user-agent": "TestBrowser/1.0" }));

    expect(SupportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ browser: "TestBrowser/1.0" }),
      }),
    );
  });

  it("generates a unique ticket ID with OM_TICKET_ prefix", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(body.ticketId).toMatch(/^OM_TICKET_\d{6}$/);
  });

  it("returns 400 when category is missing", async () => {
    const { message, pageUrl, userEmail } = validBody;
    const response = await POST(makeRequest({ message, pageUrl, userEmail }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when message is missing", async () => {
    const { category, pageUrl, userEmail } = validBody;
    const response = await POST(makeRequest({ category, pageUrl, userEmail }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when SupportTicket.create throws", async () => {
    vi.mocked(SupportTicket.create).mockRejectedValueOnce(new Error("DB error"));

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });
});
