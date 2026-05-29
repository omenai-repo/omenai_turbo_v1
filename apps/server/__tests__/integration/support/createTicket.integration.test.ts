/**
 * Integration tests for POST /api/support
 *
 * Tests ticket creation against the real in-memory MongoDB, verifying that
 * documents are persisted with the correct fields, priority assignments, and
 * ticket ID format.
 */

import { describe, it, expect, afterEach } from "vitest";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

import { POST } from "../../../app/api/support/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  category: "GENERAL",
  message: "I need help with my account.",
  pageUrl: "https://app.omenai.co/dashboard",
  userEmail: "guest@example.com",
};

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SupportTicket.deleteMany({});
});

// ── Ticket creation ───────────────────────────────────────────────────────────

describe("POST /api/support — ticket creation", () => {
  it("returns 200 and persists the ticket document", async () => {
    const res = await POST(makeRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Ticket created");

    const ticket = await SupportTicket.findOne({ ticketId: body.ticketId });
    expect(ticket).not.toBeNull();
    expect(ticket!.message).toBe(validBody.message);
  });

  it("assigns a unique ticket ID with OM_TICKET_ prefix", async () => {
    const res = await POST(makeRequest(validBody));
    const body = await res.json();

    expect(body.ticketId).toMatch(/^OM_TICKET_\d{6}$/);

    const ticket = await SupportTicket.findOne({ ticketId: body.ticketId });
    expect(ticket!.ticketId).toBe(body.ticketId);
  });

  it("sets userType to GUEST and userId to null when no session", async () => {
    await POST(makeRequest(validBody));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.userType).toBe("GUEST");
    expect(ticket!.userId).toBeNull();
    expect(ticket!.status).toBe("OPEN");
  });

  it("uses email from body when no session is present", async () => {
    await POST(makeRequest(validBody));

    const ticket = await SupportTicket.findOne({ userEmail: "guest@example.com" });
    expect(ticket).not.toBeNull();
  });

  it("stores the pageUrl in the ticket", async () => {
    await POST(makeRequest(validBody));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.pageUrl).toBe(validBody.pageUrl);
  });

  it("stores the user-agent in ticket meta when header is present", async () => {
    await POST(makeRequest(validBody, { "user-agent": "TestAgent/2.0" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.meta?.get("browser")).toBe("TestAgent/2.0");
  });

  it("creates exactly one ticket per request", async () => {
    await POST(makeRequest(validBody));

    const count = await SupportTicket.countDocuments({});
    expect(count).toBe(1);
  });
});

// ── Priority logic ────────────────────────────────────────────────────────────

describe("POST /api/support — priority assignment", () => {
  it("assigns HIGH priority to PAYMENT category", async () => {
    await POST(makeRequest({ ...validBody, category: "PAYMENT" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("HIGH");
  });

  it("assigns HIGH priority to PAYOUT category", async () => {
    await POST(makeRequest({ ...validBody, category: "PAYOUT" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("HIGH");
  });

  it("assigns HIGH priority to WALLET category", async () => {
    await POST(makeRequest({ ...validBody, category: "WALLET" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("HIGH");
  });

  it("assigns HIGH priority to SUBSCRIPTION category (via pre-save hook)", async () => {
    await POST(makeRequest({ ...validBody, category: "SUBSCRIPTION" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("HIGH");
  });

  it("assigns NORMAL priority to GENERAL category", async () => {
    await POST(makeRequest({ ...validBody, category: "GENERAL" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("NORMAL");
  });

  it("assigns NORMAL priority to ORDER category", async () => {
    await POST(makeRequest({ ...validBody, category: "ORDER" }));

    const ticket = await SupportTicket.findOne({ userEmail: validBody.userEmail });
    expect(ticket!.priority).toBe("NORMAL");
  });
});

// ── Session-aware identity ────────────────────────────────────────────────────

describe("POST /api/support — session identity", () => {
  it("overrides email and userId from session when session data is present", async () => {
    const sessionData = {
      userData: { id: "gallery-999", email: "gallery@test.com", role: "gallery" },
      csrfToken: "token-abc",
    };

    await POST(makeRequest(validBody), undefined as any, sessionData as any);

    const ticket = await SupportTicket.findOne({ userId: "gallery-999" });
    expect(ticket).not.toBeNull();
    expect(ticket!.userEmail).toBe("gallery@test.com");
    expect(ticket!.userType).toBe("GALLERY");
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/support — validation", () => {
  it("returns 400 when category is missing", async () => {
    const { message, pageUrl, userEmail } = validBody;
    const res = await POST(makeRequest({ message, pageUrl, userEmail }));

    expect(res.status).toBe(400);
    expect(await SupportTicket.countDocuments({})).toBe(0);
  });

  it("returns 400 when message is missing", async () => {
    const { category, pageUrl, userEmail } = validBody;
    const res = await POST(makeRequest({ category, pageUrl, userEmail }));

    expect(res.status).toBe(400);
    expect(await SupportTicket.countDocuments({})).toBe(0);
  });
});
