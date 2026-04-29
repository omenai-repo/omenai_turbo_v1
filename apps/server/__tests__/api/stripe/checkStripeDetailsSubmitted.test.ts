import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    accounts: { retrieve: vi.fn() },
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/checkStripeDetailsSubmitted/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/checkStripeDetailsSubmitted", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/checkStripeDetailsSubmitted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with details_submitted true when onboarding is complete", async () => {
    vi.mocked(stripe.accounts.retrieve).mockResolvedValue({
      details_submitted: true,
    } as any);

    const response = await POST(makeRequest({ accountId: "acct_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.details_submitted).toBe(true);
  });

  it("returns 200 with details_submitted false when onboarding is incomplete", async () => {
    vi.mocked(stripe.accounts.retrieve).mockResolvedValue({
      details_submitted: false,
    } as any);

    const response = await POST(makeRequest({ accountId: "acct_incomplete" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.details_submitted).toBe(false);
  });

  it("calls stripe.accounts.retrieve with the correct accountId", async () => {
    vi.mocked(stripe.accounts.retrieve).mockResolvedValue({
      details_submitted: true,
    } as any);

    await POST(makeRequest({ accountId: "acct_456" }));

    expect(stripe.accounts.retrieve).toHaveBeenCalledWith("acct_456");
  });

  it("returns 400 when accountId is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when stripe.accounts.retrieve throws", async () => {
    vi.mocked(stripe.accounts.retrieve).mockRejectedValueOnce(
      new Error("No such account"),
    );

    const response = await POST(makeRequest({ accountId: "acct_bad" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
