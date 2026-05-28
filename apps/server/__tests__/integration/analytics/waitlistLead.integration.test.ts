/**
 * Integration tests for POST /api/analytics/waitlist-lead
 *
 * Seeds WaitlistLead documents and verifies the route handles validation,
 * duplicate detection, and successful creation in the real in-memory MongoDB
 * instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

import { POST } from "../../../app/api/analytics/waitlist-lead/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeLead(overrides: Record<string, any> = {}) {
  return {
    email: "test@example.com",
    name: "Test User",
    entity: "artist",
    kpi: {},
    marketing: {},
    survey: {},
    country: "US",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/analytics/waitlist-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await WaitlistLead.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/analytics/waitlist-lead — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ name: "Test", entity: "artist" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(
      makeRequest({ email: "test@example.com", entity: "artist" }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when entity is missing", async () => {
    const res = await POST(
      makeRequest({ email: "test@example.com", name: "Test" }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing required fields");
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/analytics/waitlist-lead — success", () => {
  it("returns 201 with welcome message on successful registration", async () => {
    const res = await POST(makeRequest(makeLead({ email: "new@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Welcome to the club!");
  });

  it("persists the lead in the database", async () => {
    await POST(makeRequest(makeLead({ email: "persisted@test.com" })));

    const doc = await WaitlistLead.findOne({ email: "persisted@test.com" });
    expect(doc).not.toBeNull();
  });
});

// ── Duplicate detection ───────────────────────────────────────────────────────

describe("POST /api/analytics/waitlist-lead — duplicate detection", () => {
  it("returns 200 if lead already exists for same email+entity", async () => {
    await WaitlistLead.create(
      makeLead({ email: "existing@test.com", entity: "artist" }),
    );

    const res = await POST(
      makeRequest(makeLead({ email: "existing@test.com", entity: "artist" })),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("You are already on the list!");
  });

  it("allows same email with different entity", async () => {
    await WaitlistLead.create(
      makeLead({ email: "multi@test.com", entity: "artist" }),
    );

    const res = await POST(
      makeRequest(makeLead({ email: "multi@test.com", entity: "collector" })),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Welcome to the club!");
  });
});
