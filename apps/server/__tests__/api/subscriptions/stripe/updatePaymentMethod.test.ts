import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  Subscriptions: {
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    setupIntents: {
      retrieve: vi.fn(),
    },
    paymentMethods: {
      retrieve: vi.fn(),
    },
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { PUT } from "../../../../app/api/subscriptions/stripe/updatePaymentMethod/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const mockSetupIntent = {
  id: "seti_123",
  status: "succeeded",
  payment_method: "pm_card_visa",
};

const mockPaymentMethod = {
  id: "pm_card_visa",
  type: "card",
  card: { brand: "visa", last4: "4242" },
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/subscriptions/stripe/updatePaymentMethod",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("PUT /api/subscriptions/stripe/updatePaymentMethod", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValue(mockSetupIntent as any);
    vi.mocked(stripe.paymentMethods.retrieve).mockResolvedValue(
      mockPaymentMethod as any,
    );
    vi.mocked(Subscriptions.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when payment method is updated", async () => {
    const response = await PUT(
      makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment method updated successfully");
  });

  it("updates subscription with retrieved payment method", async () => {
    await PUT(makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }));

    expect(Subscriptions.updateOne).toHaveBeenCalledWith(
      { "customer.gallery_id": "gallery-001" },
      { $set: { paymentMethod: mockPaymentMethod } },
    );
  });

  it("returns 503 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await PUT(
      makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 400 when setup intent status is not succeeded", async () => {
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValueOnce({
      ...mockSetupIntent,
      status: "requires_action",
    } as any);

    const response = await PUT(
      makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/problem adding your payment method/i);
  });

  it("returns 400 when setup intent has no payment method", async () => {
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValueOnce({
      ...mockSetupIntent,
      payment_method: null,
    } as any);

    const response = await PUT(
      makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/No payment method/i);
  });

  it("returns 400 when setupIntentId is missing", async () => {
    const response = await PUT(makeRequest({ gallery_id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when Subscriptions.updateOne throws", async () => {
    vi.mocked(Subscriptions.updateOne).mockRejectedValueOnce(new Error("DB error"));

    const response = await PUT(
      makeRequest({ setupIntentId: "seti_123", gallery_id: "gallery-001" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
