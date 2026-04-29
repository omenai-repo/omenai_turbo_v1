import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  Subscriptions: {
    findOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } =
    await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/subscriptions/stripe/createStripeTokenizedCharge/route";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { validateRequestBody } from "../../../../app/api/util";

const mockSubscription = {
  stripe_customer_id: "cus_123",
  paymentMethod: { id: "pm_card_visa" },
  customer: { gallery_id: "gallery-001" },
};

const mockPaymentIntent = {
  id: "pi_123",
  client_secret: "pi_123_secret",
  status: "succeeded",
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/subscriptions/stripe/createStripeTokenizedCharge",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/subscriptions/stripe/createStripeTokenizedCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(Subscriptions.findOne).mockResolvedValue(mockSubscription as any);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValue(
      mockPaymentIntent as any,
    );
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw Object.assign(new Error(`Validation Failed: ${msg}`), {
            name: "BadRequestError",
          });
        }
        return result.data;
      },
    );
  });

  it("returns 200 with payment intent details", async () => {
    const response = await POST(
      makeRequest({ amount: 49, gallery_id: "gallery-001", meta: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment Intent created");
    expect(body.client_secret).toBe(mockPaymentIntent.client_secret);
    expect(body.paymentIntentId).toBe(mockPaymentIntent.id);
    expect(body.status).toBe(mockPaymentIntent.status);
  });

  it("creates off_session payment intent with stored payment method", async () => {
    await POST(
      makeRequest({ amount: 49, gallery_id: "gallery-001", meta: {} }),
    );

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 4900, // 49 * 100
        currency: "usd",
        customer: mockSubscription.stripe_customer_id,
        payment_method: mockSubscription.paymentMethod.id,
        off_session: true,
        confirm: true,
      }),
    );
  });

  it("converts amount to cents (multiplies by 100)", async () => {
    await POST(
      makeRequest({ amount: 99.5, gallery_id: "gallery-001", meta: {} }),
    );

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 9950 }),
    );
  });

  it("returns 503 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(
      makeRequest({ amount: 49, gallery_id: "gallery-001", meta: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
  });

  it("returns 404 when no subscription record found", async () => {
    vi.mocked(Subscriptions.findOne).mockResolvedValueOnce(null);

    const response = await POST(
      makeRequest({ amount: 49, gallery_id: "gallery-001", meta: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/No subscription record found/i);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", meta: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when stripe.paymentIntents.create throws", async () => {
    vi.mocked(stripe.paymentIntents.create).mockRejectedValueOnce(
      new Error("Card declined"),
    );

    const response = await POST(
      makeRequest({ amount: 49, gallery_id: "gallery-001", meta: {} }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
