/**
 * Integration tests for POST /api/stripe/createConnectedAccount
 *
 * Verifies that the route calls stripe.accounts.create, then updates the
 * AccountGallery document with the returned account ID. The stripe module
 * is re-mocked via vi.hoisted() to provide a complete stub.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

// ── Stripe mock (overrides the basic stub from setup.ts) ─────────────────────

const { mockStripe } = vi.hoisted(() => ({
  mockStripe: {
    accounts: {
      retrieve: vi.fn(),
      create: vi.fn(),
      createLoginLink: vi.fn(),
    },
    accountLinks: { create: vi.fn() },
    balance: { retrieve: vi.fn() },
    checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
    paymentIntents: { create: vi.fn(), retrieve: vi.fn() },
    tax: { transactions: { createFromCalculation: vi.fn() } },
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: mockStripe,
}));

import { POST } from "../../../app/api/stripe/createConnectedAccount/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Gallery ${uid}`,
    address: { city: "NY", country: "US" },
    description: "A test gallery",
    admin: "Admin Name",
    email: `gallery-${uid}@test.com`,
    password: "hashed",
    verified: false,
    gallery_verified: false,
    logo: "logo.jpg",
    gallery_id: `gallery-${uid}`,
    connected_account_id: "",
    ...overrides,
  };
}

function makeCustomer(overrides: Record<string, any> = {}) {
  return {
    name: "Test Gallery",
    email: "gallery@test.com",
    customer_id: "gallery-cust-001",
    country: "US",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createConnectedAccount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Teardown ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await AccountGallery.deleteMany({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/createConnectedAccount (integration)", () => {
  it("returns 400 when customer is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when customer fields are incomplete", async () => {
    const res = await POST(makeRequest({ customer: { name: "Test" } }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when stripe creates account but gallery does not exist in DB", async () => {
    mockStripe.accounts.create.mockResolvedValue({ id: "acct_test_001" });

    const customer = makeCustomer({ email: "nonexistent@test.com" });
    const res = await POST(makeRequest({ customer }));
    const body = await res.json();

    // modifiedCount === 0 triggers ServerError → 500
    expect(res.status).toBe(500);
    expect(body.message).toMatch(/something went wrong/i);
  });

  it("returns 201 with account_id and updates DB when gallery exists", async () => {
    const customer = makeCustomer({
      email: "matched@test.com",
      customer_id: "gallery-001",
    });
    await AccountGallery.create(
      makeGallery({ email: "matched@test.com", gallery_id: "gallery-001" }),
    );

    mockStripe.accounts.create.mockResolvedValue({ id: "acct_test_001" });

    const res = await POST(makeRequest({ customer }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Connected account created");
    expect(body.account_id).toBe("acct_test_001");

    const updated = await AccountGallery.findOne({ email: "matched@test.com" });
    expect(updated?.connected_account_id).toBe("acct_test_001");
  });

  it("calls stripe.accounts.create with the customer's email and country", async () => {
    const customer = makeCustomer({
      email: "check@test.com",
      country: "GB",
      customer_id: "gallery-002",
    });
    await AccountGallery.create(
      makeGallery({ email: "check@test.com", gallery_id: "gallery-002" }),
    );

    mockStripe.accounts.create.mockResolvedValue({ id: "acct_test_gb_001" });

    await POST(makeRequest({ customer }));

    expect(mockStripe.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "check@test.com",
        country: "GB",
        metadata: expect.objectContaining({ email: "check@test.com" }),
      }),
    );
  });
});
