import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    accounts: { createLoginLink: vi.fn() },
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/generateStripeLoginLink/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";

const mockLoginLink = { url: "https://connect.stripe.com/login/abc123" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/generateStripeLoginLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/generateStripeLoginLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripe.accounts.createLoginLink).mockResolvedValue(mockLoginLink as any);
  });

  it("returns 200 with login link url on success", async () => {
    const response = await POST(makeRequest({ account: "acct_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe(mockLoginLink.url);
  });

  it("passes account id directly to stripe", async () => {
    await POST(makeRequest({ account: "acct_456" }));

    expect(stripe.accounts.createLoginLink).toHaveBeenCalledWith("acct_456");
  });

  it("returns 500 when stripe.accounts.createLoginLink throws", async () => {
    vi.mocked(stripe.accounts.createLoginLink).mockRejectedValueOnce(
      new Error("Account not found"),
    );

    const response = await POST(makeRequest({ account: "acct_bad" }));

    expect(response.status).toBe(500);
  });
});
