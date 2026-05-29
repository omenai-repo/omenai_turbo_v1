/**
 * Integration tests for GET /api/support/fetchUserTickets
 *
 * Seeds SupportTicket documents and verifies filtering, searching, pagination,
 * and year-range queries against the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import SupportTicket from "@omenai/shared-models/models/support/SupportTicketSchema";

import { GET } from "../../../app/api/support/fetchUserTickets/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

let ticketCounter = 100000;
function makeTicket(overrides: Record<string, any> = {}) {
  const id = (++ticketCounter).toString();
  return {
    ticketId: `OM_TICKET_${id}`,
    userEmail: "user@test.com",
    userType: "USER",
    userId: "user-001",
    category: "GENERAL",
    message: `Test message ${id}`,
    pageUrl: "https://app.omenai.co",
    status: "OPEN",
    priority: "NORMAL",
    ...overrides,
  };
}

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/support/fetchUserTickets");
  url.searchParams.set("id", "user-001");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SupportTicket.deleteMany({});
});

// ── Basic queries ─────────────────────────────────────────────────────────────

describe("GET /api/support/fetchUserTickets — basic", () => {
  beforeEach(async () => {
    await SupportTicket.create([
      makeTicket({ userId: "user-001", category: "GENERAL", status: "OPEN" }),
      makeTicket({ userId: "user-001", category: "PAYMENT", status: "RESOLVED", priority: "HIGH" }),
      makeTicket({ userId: "user-002", category: "GENERAL", status: "OPEN" }),
    ]);
  });

  it("returns 200 with tickets scoped to the given userId", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data.every((t: any) => t.userId === "user-001")).toBe(true);
  });

  it("returns pagination metadata with correct total and totalPages", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.pagination).toMatchObject({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("returns empty data array when user has no tickets", async () => {
    const res = await GET(makeRequest({ id: "unknown-user" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });
});

// ── Filters ───────────────────────────────────────────────────────────────────

describe("GET /api/support/fetchUserTickets — filters", () => {
  beforeEach(async () => {
    await SupportTicket.create([
      makeTicket({ userId: "user-001", status: "OPEN", priority: "NORMAL", category: "GENERAL" }),
      makeTicket({ userId: "user-001", status: "RESOLVED", priority: "HIGH", category: "PAYMENT" }),
      makeTicket({ userId: "user-001", status: "OPEN", priority: "HIGH", category: "WALLET" }),
    ]);
  });

  it("filters by status=OPEN", async () => {
    const res = await GET(makeRequest({ status: "OPEN" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
    expect(body.data.every((t: any) => t.status === "OPEN")).toBe(true);
  });

  it("filters by status=RESOLVED", async () => {
    const res = await GET(makeRequest({ status: "RESOLVED" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].status).toBe("RESOLVED");
  });

  it("returns all tickets when status=ALL", async () => {
    const res = await GET(makeRequest({ status: "ALL" }));
    const body = await res.json();

    expect(body.data).toHaveLength(3);
  });

  it("filters by priority=HIGH", async () => {
    const res = await GET(makeRequest({ priority: "HIGH" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
    expect(body.data.every((t: any) => t.priority === "HIGH")).toBe(true);
  });

  it("returns all tickets when priority=ALL", async () => {
    const res = await GET(makeRequest({ priority: "ALL" }));
    const body = await res.json();

    expect(body.data).toHaveLength(3);
  });
});

// ── Search ────────────────────────────────────────────────────────────────────

describe("GET /api/support/fetchUserTickets — search", () => {
  beforeEach(async () => {
    await SupportTicket.create([
      makeTicket({ userId: "user-001", message: "Payment failed for order 123" }),
      makeTicket({ userId: "user-001", message: "I cannot upload my artwork" }),
    ]);
  });

  it("searches by message content (case-insensitive)", async () => {
    const res = await GET(makeRequest({ search: "payment" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].message).toMatch(/payment/i);
  });

  it("searches by ticketId", async () => {
    // Get a ticket to know its ticketId
    const all = await GET(makeRequest());
    const allBody = await all.json();
    const targetId = allBody.data[0].ticketId;

    const res = await GET(makeRequest({ search: targetId }));
    const body = await res.json();

    expect(body.data.some((t: any) => t.ticketId === targetId)).toBe(true);
  });

  it("returns empty array when search term matches nothing", async () => {
    const res = await GET(makeRequest({ search: "nonexistent-term-xyz" }));
    const body = await res.json();

    expect(body.data).toEqual([]);
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

describe("GET /api/support/fetchUserTickets — pagination", () => {
  beforeEach(async () => {
    const tickets = Array.from({ length: 15 }, (_, i) =>
      makeTicket({ userId: "user-001", message: `Ticket message ${i}` }),
    );
    await SupportTicket.create(tickets);
  });

  it("returns default page 1 with limit 10", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.data).toHaveLength(10);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.totalPages).toBe(2);
  });

  it("returns remaining records on page 2", async () => {
    const res = await GET(makeRequest({ page: "2" }));
    const body = await res.json();

    expect(body.data).toHaveLength(5);
    expect(body.pagination.page).toBe(2);
  });

  it("respects custom limit parameter", async () => {
    const res = await GET(makeRequest({ page: "1", limit: "5" }));
    const body = await res.json();

    expect(body.data).toHaveLength(5);
    expect(body.pagination.totalPages).toBe(3);
  });
});

// ── Year filter ───────────────────────────────────────────────────────────────

describe("GET /api/support/fetchUserTickets — year filter", () => {
  it("filters tickets by year range", async () => {
    await SupportTicket.create([
      makeTicket({ userId: "user-001", createdAt: new Date("2024-06-15") }),
      makeTicket({ userId: "user-001", createdAt: new Date("2025-03-10") }),
    ]);

    const res = await GET(makeRequest({ year: "2025" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(new Date(body.data[0].createdAt).getFullYear()).toBe(2025);
  });

  it("returns all tickets when year=ALL", async () => {
    await SupportTicket.create([
      makeTicket({ userId: "user-001" }),
      makeTicket({ userId: "user-001" }),
    ]);

    const res = await GET(makeRequest({ year: "ALL" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
  });
});
