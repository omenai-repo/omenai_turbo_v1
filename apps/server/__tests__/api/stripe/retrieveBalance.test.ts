import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    balance: { retrieve: vi.fn() },
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/retrieveBalance/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";

const mockBalance = {
  available: [{ amount: 50000, currency: "usd" }],
  pending: [{ amount: 10000, currency: "usd" }],
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/retrieveBalance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/retrieveBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripe.balance.retrieve).mockResolvedValue(mockBalance as any);
  });

  it("returns 200 with balance data on success", async () => {
    const response = await POST(makeRequest({ account: "acct_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockBalance);
  });

  it("calls stripe.balance.retrieve with stripeAccount param", async () => {
    await POST(makeRequest({ account: "acct_123" }));

    expect(stripe.balance.retrieve).toHaveBeenCalledWith({
      stripeAccount: "acct_123",
    });
  });

  it("returns 500 when stripe.balance.retrieve throws", async () => {
    vi.mocked(stripe.balance.retrieve).mockRejectedValueOnce(
      new Error("Account not found"),
    );

    const response = await POST(makeRequest({ account: "acct_bad" }));

    expect(response.status).toBe(500);
  });
});
