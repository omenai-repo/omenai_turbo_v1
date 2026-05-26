/**
 * Integration tests for POST /api/update/individual/profile
 *
 * Like the artist route, this uses `updateOne` which always returns a truthy
 * result — so the route always responds 200.  Tests verify the actual DB
 * mutations and isolation guarantees.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { POST } from "../../../app/api/update/individual/profile/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/update/individual/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeIndividual(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Test User ${uid}`,
    email: `user-${uid}@test.com`,
    password: "hashedpassword123",
    preferences: ["painting", "sculpture"],
    address: {
      address_line: "5 Victoria Island",
      city: "Lagos",
      country: "Nigeria",
      countryCode: "NG",
      state: "Lagos",
      stateCode: "LG",
      zip: "101001",
    },
    user_id: `user-${uid}`,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
});

// ── No matching user ─────────────────────────────────────────────────────────

describe("POST /api/update/individual/profile — no matching user", () => {
  it("returns 200 even when the user_id does not exist (updateOne never throws)", async () => {
    const res = await POST(makeRequest({ id: "ghost-user-id", name: "Ghost User" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile data updated");
  });
});

// ── Successful update ────────────────────────────────────────────────────────

describe("POST /api/update/individual/profile — successful update", () => {
  it("updates the user's name in the database", async () => {
    const user = await AccountIndividual.create(makeIndividual({ name: "Original Name" }));

    const res = await POST(makeRequest({ id: user.user_id, name: "New Name" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile data updated");

    const updated = await AccountIndividual.findOne({ user_id: user.user_id });
    expect(updated!.name).toBe("New Name");
  });

  it("updates the phone number", async () => {
    const user = await AccountIndividual.create(makeIndividual({ phone: "0800000000" }));

    await POST(makeRequest({ id: user.user_id, phone: "+2348012345678" }));

    const updated = await AccountIndividual.findOne({ user_id: user.user_id });
    expect(updated!.phone).toBe("+2348012345678");
  });

  it("preserves unmodified fields when updating a subset of fields", async () => {
    const user = await AccountIndividual.create(makeIndividual({
      name: "Preserved Name",
      preferences: ["photography"],
    }));

    await POST(makeRequest({ id: user.user_id, phone: "+1234567890" }));

    const updated = await AccountIndividual.findOne({ user_id: user.user_id });
    expect(updated!.name).toBe("Preserved Name");
    expect(updated!.preferences).toContain("photography");
  });

  it("can update multiple fields in a single request", async () => {
    const user = await AccountIndividual.create(makeIndividual());

    await POST(makeRequest({
      id: user.user_id,
      name: "Multi-field Update",
      phone: "+23480987654",
    }));

    const updated = await AccountIndividual.findOne({ user_id: user.user_id });
    expect(updated!.name).toBe("Multi-field Update");
    expect(updated!.phone).toBe("+23480987654");
  });

  it("does not modify other users' documents", async () => {
    const userA = await AccountIndividual.create(makeIndividual({ name: "User A" }));
    const userB = await AccountIndividual.create(makeIndividual({ name: "User B" }));

    await POST(makeRequest({ id: userA.user_id, name: "User A — Updated" }));

    const b = await AccountIndividual.findOne({ user_id: userB.user_id });
    expect(b!.name).toBe("User B");
  });

  it("response body does NOT include sensitive fields like password", async () => {
    const user = await AccountIndividual.create(makeIndividual());

    const res = await POST(makeRequest({ id: user.user_id, name: "Secure Test" }));
    const body = await res.json();

    // The route only returns { message } — no user data leaked
    expect(body.password).toBeUndefined();
    expect(body.email).toBeUndefined();
  });
});
