import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://test-api.com"),
}));

vi.mock("@omenai/rollbar-config", () => ({
  logRollbarServerError: vi.fn(),
}));

import { cancelSubscription } from "../../subscriptions/cancelSubscription";
import { retrieveSubscriptionData } from "../../subscriptions/retrieveSubscriptionData";
import { verifySubscriptionCharge } from "../../subscriptions/stripe/verifySubscriptionCharge";
import { createSubscriptionPaymentIntent } from "../../subscriptions/stripe/createSubscriptionPaymentIntent";
import { logRollbarServerError } from "@omenai/rollbar-config";
import type { SubscriptionMetaData } from "@omenai/shared-types";

const NETWORK_ERROR_MSG =
  "An error was encountered, please try again later or contact support";

const TOKEN = "csrf-sub-token";

function mockFetchOk(body: object, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, json: async () => body }),
  );
}

function mockFetchThrows(message = "Network failure") {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(message)));
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*                        cancelSubscription                           */
/* ------------------------------------------------------------------ */

describe("cancelSubscription", () => {
  it("POSTs to the correct endpoint with gallery_id and CSRF token", async () => {
    mockFetchOk({ message: "Subscription cancelled" });

    await cancelSubscription("gallery-1", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/subscriptions/cancelSubscription",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ gallery_id: "gallery-1" }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Cancelled" });

    const result = await cancelSubscription("gallery-1", TOKEN);

    expect(result).toEqual({ isOk: true, message: "Cancelled" });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "No active subscription" }, false);

    const result = await cancelSubscription("gallery-1", TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("No active subscription");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await cancelSubscription("gallery-1", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                     retrieveSubscriptionData                        */
/* ------------------------------------------------------------------ */

describe("retrieveSubscriptionData", () => {
  const subData = { status: "active", expiry_date: "2026-01-01" };
  const planData = { name: "premium", price: 100 };

  it("POSTs to the correct endpoint with gallery_id and CSRF token", async () => {
    mockFetchOk({ message: "OK", data: subData, plan: planData });

    await retrieveSubscriptionData("gallery-2", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/subscriptions/retrieveSubData",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ gallery_id: "gallery-2" }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk, message, data, plan } on success", async () => {
    mockFetchOk({ message: "OK", data: subData, plan: planData });

    const result = await retrieveSubscriptionData("gallery-2", TOKEN);

    expect(result).toEqual({
      isOk: true,
      message: "OK",
      data: subData,
      plan: planData,
    });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Not found", data: null, plan: null }, false);

    const result = await retrieveSubscriptionData("gallery-2", TOKEN);

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await retrieveSubscriptionData("gallery-2", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                      verifySubscriptionCharge                       */
/* ------------------------------------------------------------------ */

describe("verifySubscriptionCharge", () => {
  it("POSTs to the correct endpoint with paymentIntentId and CSRF token", async () => {
    mockFetchOk({ message: "Verified" });

    await verifySubscriptionCharge("pi_abc_123", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/subscriptions/stripe/verifyStripeSubscriptionCharge",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ paymentIntentId: "pi_abc_123" }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Charge verified" });

    const result = await verifySubscriptionCharge("pi_abc_123", TOKEN);

    expect(result).toEqual({ isOk: true, message: "Charge verified" });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Payment intent not found" }, false);

    const result = await verifySubscriptionCharge("pi_bad", TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Payment intent not found");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await verifySubscriptionCharge("pi_abc_123", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                  createSubscriptionPaymentIntent                    */
/* ------------------------------------------------------------------ */

describe("createSubscriptionPaymentIntent", () => {
  const meta: SubscriptionMetaData = {
    type: "subscription",
    gallery_id: "gallery-3",
    plan_id: "plan-premium",
    planInterval: "monthly",
    name: "Test Gallery",
    email: "gallery@test.com",
    customer: "cus_test_123",
  };

  it("POSTs to the correct endpoint with amount, gallery_id, meta, and CSRF token", async () => {
    mockFetchOk({ message: "Intent created", paymentIntent: "cs_secret_xyz" });

    await createSubscriptionPaymentIntent(9900, "gallery-3", meta, TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/subscriptions/stripe/createSubscriptionPaymentIntent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ amount: 9900, gallery_id: "gallery-3", meta }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk, message, client_secret } on success", async () => {
    mockFetchOk({ message: "Created", paymentIntent: "cs_secret_xyz" });

    const result = await createSubscriptionPaymentIntent(9900, "gallery-3", meta, TOKEN);

    expect(result).toEqual({
      isOk: true,
      message: "Created",
      client_secret: "cs_secret_xyz",
    });
  });

  it("maps paymentIntent response field to client_secret", async () => {
    mockFetchOk({ message: "OK", paymentIntent: "pi_secret_abc" });

    const result = await createSubscriptionPaymentIntent(9900, "gallery-3", meta, TOKEN);

    expect(result.client_secret).toBe("pi_secret_abc");
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Validation failed", paymentIntent: null }, false);

    const result = await createSubscriptionPaymentIntent(9900, "gallery-3", meta, TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Validation failed");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await createSubscriptionPaymentIntent(9900, "gallery-3", meta, TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});
