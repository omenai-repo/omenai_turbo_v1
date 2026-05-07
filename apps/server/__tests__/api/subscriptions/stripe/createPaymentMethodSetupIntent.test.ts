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

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    customers: {
      retrieve: vi.fn(),
      create: vi.fn(),
    },
    setupIntents: {
      create: vi.fn(),
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

import { POST } from "../../../../app/api/subscriptions/stripe/createPaymentMethodSetupIntent/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const mockGalleryWithCustomer = { stripe_customer_id: "cus_existing_123" };
const mockGalleryNoCustomer = { stripe_customer_id: null };
const mockCustomer = { id: "cus_new_456" };
const mockSetupIntent = { client_secret: "seti_abc_secret_xyz" };

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/subscriptions/stripe/createPaymentMethodSetupIntent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/subscriptions/stripe/createPaymentMethodSetupIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockGalleryWithCustomer),
    } as any);
    vi.mocked(stripe.customers.retrieve).mockResolvedValue(mockCustomer as any);
    vi.mocked(stripe.setupIntents.create).mockResolvedValue(mockSetupIntent as any);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 with setup intent for existing Stripe customer", async () => {
    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment Method setup intent created");
    expect(body.setupIntent).toBe(mockSetupIntent.client_secret);
  });

  it("retrieves existing Stripe customer when stripe_customer_id exists", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }));

    expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_existing_123");
    expect(stripe.customers.create).not.toHaveBeenCalled();
  });

  it("creates new Stripe customer when gallery has no stripe_customer_id", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockGalleryNoCustomer),
    } as any);
    vi.mocked(stripe.customers.create).mockResolvedValue(mockCustomer as any);

    await POST(makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }));

    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: "gallery@test.com",
    });
    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-001" },
      { $set: { stripe_customer_id: mockCustomer.id } },
    );
  });

  it("creates setup intent with off_session usage", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }));

    expect(stripe.setupIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: mockCustomer.id,
        usage: "off_session",
      }),
    );
  });

  it("returns 503 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }),
    );

    expect(response.status).toBe(503);
  });

  it("returns 500 when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(
      makeRequest({ gallery_id: "unknown", email: "gallery@test.com" }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({ email: "gallery@test.com" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", email: "not-an-email" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 500 when stripe.setupIntents.create throws", async () => {
    vi.mocked(stripe.setupIntents.create).mockRejectedValueOnce(
      new Error("Stripe error"),
    );

    const response = await POST(
      makeRequest({ gallery_id: "gallery-001", email: "gallery@test.com" }),
    );

    expect(response.status).toBe(500);
  });
});
