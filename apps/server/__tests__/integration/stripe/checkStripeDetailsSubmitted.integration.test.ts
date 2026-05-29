/**
 * Integration tests for POST /api/stripe/checkStripeDetailsSubmitted
 *
 * Verifies that the route calls stripe.accounts.retrieve and returns
 * the details_submitted flag. The stripe module is re-mocked via
 * vi.hoisted() to provide a more complete stub over the basic one from setup.ts.
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

import { POST } from "../../../app/api/stripe/checkStripeDetailsSubmitted/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/checkStripeDetailsSubmitted", {
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

describe("POST /api/stripe/checkStripeDetailsSubmitted (integration)", () => {
  it("returns 400 when accountId is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 200 with details_submitted: true when stripe returns true", async () => {
    mockStripe.accounts.retrieve.mockResolvedValue({ details_submitted: true });

    const res = await POST(makeRequest({ accountId: "acct_test_001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.details_submitted).toBe(true);
    expect(mockStripe.accounts.retrieve).toHaveBeenCalledWith("acct_test_001");
  });

  it("returns 200 with details_submitted: false when stripe returns false", async () => {
    mockStripe.accounts.retrieve.mockResolvedValue({ details_submitted: false });

    const res = await POST(makeRequest({ accountId: "acct_test_002" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.details_submitted).toBe(false);
  });

  it("returns 500 when stripe.accounts.retrieve throws", async () => {
    mockStripe.accounts.retrieve.mockRejectedValue(new Error("Stripe error"));

    const res = await POST(makeRequest({ accountId: "acct_test_003" }));

    expect(res.status).toBe(500);
  });
});
