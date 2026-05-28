/**
 * Integration tests for POST /api/flw/createCheckoutSession
 * Checks feature flag, calls Flutterwave payments API, returns checkout link.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { POST } from "../../../app/api/flw/createCheckoutSession/route";

const { mockFetchConfigCatValue } = vi.hoisted(() => ({
  mockFetchConfigCatValue: vi.fn(),
}));
vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: mockFetchConfigCatValue,
}));

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal("fetch", mockFetch);

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/flw/createCheckoutSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const defaultBody = {
  customer: { name: "Test User", email: "user@test.com" },
  amount: 500,
  tx_ref: "txn-001",
  redirect: "https://app.test/callback",
  meta: { art_id: "art-001" },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("POST /api/flw/createCheckoutSession — feature flag disabled", () => {
  it("returns 503 with a message matching /disabled/i when flutterwave_payment_enabled is false", async () => {
    mockFetchConfigCatValue.mockResolvedValueOnce(false);

    const response = await POST(makeRequest(defaultBody));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });
});

describe("POST /api/flw/createCheckoutSession — success", () => {
  it("returns 200 with the checkout link when feature is enabled and fetch succeeds", async () => {
    mockFetchConfigCatValue.mockResolvedValueOnce(true);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { link: "https://pay.flutterwave.com/pay/abc123" },
      }),
    });

    const response = await POST(makeRequest(defaultBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Done");
    expect(body.data).toBe("https://pay.flutterwave.com/pay/abc123");
  });
});
