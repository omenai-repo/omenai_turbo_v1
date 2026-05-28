/**
 * Integration tests for POST /api/stripe/retrieveBalance
 *
 * Verifies that the route calls stripe.balance.retrieve with the correct
 * stripeAccount parameter and returns the balance data. The stripe module
 * is re-mocked via vi.hoisted() to provide a complete stub over the basic
 * one from setup.ts.
 */

import { describe, it, expect, afterEach, vi } from "vitest";

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

import { POST } from "../../../app/api/stripe/retrieveBalance/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/retrieveBalance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Teardown ──────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/retrieveBalance (integration)", () => {
  it("returns 400 when account is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 200 with balance data when stripe retrieve succeeds", async () => {
    const mockBalance = {
      object: "balance",
      available: [{ amount: 10000, currency: "usd", source_types: { card: 10000 } }],
      pending: [{ amount: 5000, currency: "usd", source_types: { card: 5000 } }],
      livemode: false,
    };
    mockStripe.balance.retrieve.mockResolvedValue(mockBalance);

    const res = await POST(makeRequest({ account: "acct_test_001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(mockBalance);
    expect(mockStripe.balance.retrieve).toHaveBeenCalledWith({
      stripeAccount: "acct_test_001",
    });
  });

  it("returns 500 when stripe.balance.retrieve throws", async () => {
    mockStripe.balance.retrieve.mockRejectedValue(new Error("Stripe error"));

    const res = await POST(makeRequest({ account: "acct_test_002" }));

    expect(res.status).toBe(500);
  });
});
