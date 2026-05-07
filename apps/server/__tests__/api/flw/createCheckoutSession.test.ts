import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/flw/createCheckoutSession/route";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const checkoutPayload = {
  customer: { email: "buyer@test.com", name: "John Doe" },
  amount: 1500,
  tx_ref: "txn-abc123",
  redirect: "https://omenai.com/success",
  meta: { art_id: "art-1" },
};

const mockFlwLink = "https://checkout.flutterwave.com/v3/hosted/pay/xyz123";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/flw/createCheckoutSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/flw/createCheckoutSession", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    fetchSpy = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ data: { link: mockFlwLink } }),
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with checkout link on success", async () => {
    const response = await POST(makeRequest(checkoutPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Done");
    expect(body.data).toBe(mockFlwLink);
  });

  it("posts to Flutterwave payments endpoint with correct payload shape", async () => {
    await POST(makeRequest(checkoutPayload));

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.flutterwave.com/v3/payments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("txn-abc123"),
      }),
    );
  });

  it("returns 503 when flutterwave_payment_enabled feature flag is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValue(false);

    const response = await POST(makeRequest(checkoutPayload));

    expect(response.status).toBe(503);
  });

  it("returns 500 when fetch throws a network error", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));

    const response = await POST(makeRequest(checkoutPayload));

    expect(response.status).toBe(500);
  });
});
