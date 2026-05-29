/**
 * Integration tests for POST /api/stripe/createAccountLink
 *
 * Verifies that the route calls stripe.accountLinks.create with the correct
 * parameters (using dashboard_url for refresh/return URLs) and returns the
 * resulting account link URL. Both stripe and url-config are re-mocked via
 * vi.hoisted() so the mocks are hoisted before the route import.
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

// ── URL config mock ───────────────────────────────────────────────────────────

vi.mock("@omenai/url-config/src/config", () => ({
  dashboard_url: () => "https://app.omenai.com",
}));

import { POST } from "../../../app/api/stripe/createAccountLink/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createAccountLink", {
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

describe("POST /api/stripe/createAccountLink (integration)", () => {
  it("returns 400 when account is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 200 with url when stripe creates the account link", async () => {
    mockStripe.accountLinks.create.mockResolvedValue({
      url: "https://connect.stripe.com/setup/s/abc123",
    });

    const res = await POST(makeRequest({ account: "acct_test_001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://connect.stripe.com/setup/s/abc123");
  });

  it("calls stripe.accountLinks.create with correct parameters", async () => {
    mockStripe.accountLinks.create.mockResolvedValue({
      url: "https://connect.stripe.com/setup/s/xyz789",
    });

    await POST(makeRequest({ account: "acct_test_002" }));

    expect(mockStripe.accountLinks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account: "acct_test_002",
        type: "account_onboarding",
        refresh_url: expect.stringContaining("acct_test_002"),
        return_url: expect.stringContaining("https://app.omenai.com"),
      }),
    );
  });

  it("returns 500 when stripe.accountLinks.create throws", async () => {
    mockStripe.accountLinks.create.mockRejectedValue(new Error("Stripe error"));

    const res = await POST(makeRequest({ account: "acct_test_003" }));

    expect(res.status).toBe(500);
  });
});
