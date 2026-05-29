/**
 * Integration tests for GET /api/admin/fetch_collectors
 *
 * Seeds AccountIndividual documents and verifies the route correctly returns
 * paginated verified collectors from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

import { GET } from "../../../app/api/admin/fetch_collectors/route";

// ── Fixture factory ───────────────────────────────────────────────────────────

let userCounter = 0;

function makeIndividual(overrides: Record<string, any> = {}) {
  userCounter += 1;
  return {
    name: "Test User",
    email: `user-${userCounter}@test.com`,
    password: "x",
    user_id: `user-${userCounter}`,
    verified: false,
    preferences: [],
    role: "user",
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeRequest(params: Record<string, string | number> = {}): Request {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  const url = query
    ? `http://localhost/api/admin/fetch_collectors?${query}`
    : "http://localhost/api/admin/fetch_collectors";

  return new Request(url, { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
  userCounter = 0;
});

// ── No data ───────────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_collectors — no data", () => {
  it("returns 200 with empty data when no verified collectors exist", async () => {
    const res = await GET(makeRequest({ page: 1, limit: 20 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });
});

// ── Filtering ─────────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_collectors — filtering", () => {
  it("returns only verified collectors", async () => {
    await AccountIndividual.create([
      makeIndividual({ verified: true }),
      makeIndividual({ verified: true }),
      makeIndividual({ verified: false }),
    ]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.length).toBe(2);
    expect(body.total).toBe(2);
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_collectors — pagination", () => {
  it("returns correct pagination metadata", async () => {
    await AccountIndividual.create([
      makeIndividual({ verified: true }),
      makeIndividual({ verified: true }),
      makeIndividual({ verified: true }),
    ]);

    const res = await GET(makeRequest({ page: 1, limit: 2 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(2);
    expect(body.pages).toBe(2);
    expect(body.total).toBe(3);
  });
});

// ── Response shape ────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_collectors — response shape", () => {
  it("returns the correct message", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.message).toBe("Successfully fetched all collectors");
  });
});
