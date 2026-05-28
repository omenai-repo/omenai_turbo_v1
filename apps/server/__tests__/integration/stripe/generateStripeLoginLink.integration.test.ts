/**
 * Integration tests for POST /api/stripe/generateStripeLoginLink
 *
 * Verifies that the route calls stripe.accounts.createLoginLink and returns
 * the resulting URL. The stripe module is re-mocked via vi.hoisted() to
 * provide a complete stub over the basic one from setup.ts.
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

import { POST } from "../../../app/api/stripe/generateStripeLoginLink/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/generateStripeLoginLink", {
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

describe("POST /api/stripe/generateStripeLoginLink (integration)", () => {
  it("returns 400 when account is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 200 with url when stripe creates the login link", async () => {
    mockStripe.accounts.createLoginLink.mockResolvedValue({
      url: "https://connect.stripe.com/express/login/acct_test_001",
    });

    const res = await POST(makeRequest({ account: "acct_test_001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe(
      "https://connect.stripe.com/express/login/acct_test_001",
    );
    expect(mockStripe.accounts.createLoginLink).toHaveBeenCalledWith(
      "acct_test_001",
    );
  });

  it("returns 500 when stripe.accounts.createLoginLink throws", async () => {
    mockStripe.accounts.createLoginLink.mockRejectedValue(
      new Error("Stripe error"),
    );

    const res = await POST(makeRequest({ account: "acct_test_002" }));

    expect(res.status).toBe(500);
  });
});
