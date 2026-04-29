import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    accountLinks: { create: vi.fn() },
  },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  dashboard_url: vi.fn().mockReturnValue("https://dashboard.omenai.app"),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/createAccountLink/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { dashboard_url } from "@omenai/url-config/src/config";

const mockAccountLink = { url: "https://connect.stripe.com/onboarding/abc123" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createAccountLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/createAccountLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripe.accountLinks.create).mockResolvedValue(mockAccountLink as any);
  });

  it("returns 200 with account link url on success", async () => {
    const response = await POST(makeRequest({ account: "acct_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe(mockAccountLink.url);
  });

  it("calls stripe.accountLinks.create with correct params", async () => {
    const dashUrl = "https://dashboard.omenai.app";
    vi.mocked(dashboard_url).mockReturnValue(dashUrl);

    await POST(makeRequest({ account: "acct_123" }));

    expect(stripe.accountLinks.create).toHaveBeenCalledWith({
      account: "acct_123",
      refresh_url: `${dashUrl}/gallery/payouts/refresh?id=acct_123`,
      return_url: `${dashUrl}/gallery/payouts`,
      type: "account_onboarding",
    });
  });

  it("returns 400 when account field is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when stripe.accountLinks.create throws", async () => {
    vi.mocked(stripe.accountLinks.create).mockRejectedValueOnce(
      new Error("Stripe error"),
    );

    const response = await POST(makeRequest({ account: "acct_123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
