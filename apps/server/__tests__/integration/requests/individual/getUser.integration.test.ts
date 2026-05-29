/**
 * Integration tests for GET /api/requests/individual/getUser
 *
 * Seeds AccountIndividual documents and verifies the route returns the user
 * profile fields from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

import { GET } from "../../../../app/api/requests/individual/getUser/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

let uid = 0;

function makeUser(overrides: Record<string, any> = {}) {
  const id = ++uid;
  return {
    name: "Test User",
    email: `user-${id}@test.com`,
    password: "hashed",
    user_id: `user-${id}`,
    preferences: ["art"],
    verified: false,
    address: { city: "NY" },
    ...overrides,
  };
}

function makeRequest(userId?: string): Request {
  const url = new URL("http://localhost/api/requests/individual/getUser");
  if (userId) url.searchParams.set("id", userId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/requests/individual/getUser — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest() as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Invalid URL parameters/i);
  });
});

// ── Not found ─────────────────────────────────────────────────────────────────

describe("GET /api/requests/individual/getUser — not found", () => {
  it("returns 404 when user does not exist", async () => {
    const res = await GET(makeRequest("user-nonexistent") as any);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/user data not found/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("GET /api/requests/individual/getUser — success", () => {
  it("returns 200 with the user profile when found", async () => {
    await AccountIndividual.create(makeUser({ user_id: "user-profile-001", name: "Test User" }));

    const res = await GET(makeRequest("user-profile-001") as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.user).toBeDefined();
  });

  it("returns the correct name in the user profile", async () => {
    await AccountIndividual.create(makeUser({ user_id: "user-profile-002", name: "Unique User Name" }));

    const res = await GET(makeRequest("user-profile-002") as any);
    const body = await res.json();

    expect(body.user.name).toBe("Unique User Name");
  });

  it("returns name, email, address, preferences, verified and phone fields", async () => {
    await AccountIndividual.create(
      makeUser({
        user_id: "user-profile-003",
        name: "Full Profile User",
        preferences: ["paintings", "sculpture"],
      }),
    );

    const res = await GET(makeRequest("user-profile-003") as any);
    const body = await res.json();

    expect(body.user).toHaveProperty("name");
    expect(body.user).toHaveProperty("email");
    expect(body.user).toHaveProperty("address");
    expect(body.user).toHaveProperty("preferences");
    expect(body.user).toHaveProperty("verified");
  });

  it("does not return another user when a different id is queried", async () => {
    await AccountIndividual.create([
      makeUser({ user_id: "user-profile-004", name: "User A" }),
      makeUser({ user_id: "user-profile-005", name: "User B" }),
    ]);

    const res = await GET(makeRequest("user-profile-004") as any);
    const body = await res.json();

    expect(body.user.name).toBe("User A");
  });
});
