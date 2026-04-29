import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail",
  () => ({ sendPaymentSuccessMail: vi.fn() }),
);

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMailArtist",
  () => ({ sendPaymentSuccessMailArtist: vi.fn() }),
);

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail",
  () => ({ sendPaymentSuccessGalleryMail: vi.fn() }),
);

vi.mock("@omenai/shared-utils/src/formatIntlDateTime", () => ({
  formatIntlDateTime: vi.fn((d: string) => d),
}));

import { POST } from "../../../../app/api/workflows/emails/sendPaymentSuccessMail/route";
import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";
import { sendPaymentSuccessMailArtist } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMailArtist";
import { sendPaymentSuccessGalleryMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail";

const basePayload = {
  buyer_email: "buyer@test.com",
  buyer_name: "John Buyer",
  artwork_title: "Test Artwork",
  order_id: "order-123",
  order_date: "2024-01-01T00:00:00.000Z",
  transaction_id: "tx-123",
  price: "$500",
  seller_email: "seller@test.com",
  seller_name: "Jane Seller",
  artwork_image: "https://example.com/image.jpg",
  artist: "Jane Artist",
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/emails/sendPaymentSuccessMail",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/emails/sendPaymentSuccessMail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendPaymentSuccessMail).mockResolvedValue({ error: false, message: "sent" });
    vi.mocked(sendPaymentSuccessMailArtist).mockResolvedValue({ error: false, message: "sent" });
    vi.mocked(sendPaymentSuccessGalleryMail).mockResolvedValue({ error: false, message: "sent" });
  });

  it("returns 201 when buyer and artist seller emails succeed", async () => {
    const response = await POST(makeRequest({ ...basePayload, seller_entity: "artist" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toBe("Successful");
    expect(sendPaymentSuccessMail).toHaveBeenCalledOnce();
    expect(sendPaymentSuccessMailArtist).toHaveBeenCalledOnce();
  });

  it("returns 201 when buyer and gallery seller emails succeed", async () => {
    const response = await POST(makeRequest({ ...basePayload, seller_entity: "gallery" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(sendPaymentSuccessGalleryMail).toHaveBeenCalledOnce();
    expect(sendPaymentSuccessMailArtist).not.toHaveBeenCalled();
  });

  it("returns 500 when buyer email returns error", async () => {
    vi.mocked(sendPaymentSuccessMail).mockResolvedValue({ error: true, message: "failed" });

    const response = await POST(makeRequest({ ...basePayload, seller_entity: "artist" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error sending email");
  });

  it("returns 500 when seller email returns error", async () => {
    vi.mocked(sendPaymentSuccessMailArtist).mockResolvedValue({ error: true, message: "failed" });

    const response = await POST(makeRequest({ ...basePayload, seller_entity: "artist" }));

    expect(response.status).toBe(500);
  });

  it("calls sendPaymentSuccessMail with correct buyer data", async () => {
    await POST(makeRequest({ ...basePayload, seller_entity: "artist" }));

    expect(sendPaymentSuccessMail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: basePayload.buyer_email,
        name: basePayload.buyer_name,
        artwork: basePayload.artwork_title,
        order_id: basePayload.order_id,
        transaction_id: basePayload.transaction_id,
        price: basePayload.price,
        artistName: basePayload.artist,
        artworkImage: basePayload.artwork_image,
      }),
    );
  });

  it("calls sendPaymentSuccessMailArtist with correct seller data", async () => {
    await POST(makeRequest({ ...basePayload, seller_entity: "artist" }));

    expect(sendPaymentSuccessMailArtist).toHaveBeenCalledWith(
      expect.objectContaining({
        email: basePayload.seller_email,
        name: basePayload.seller_name,
        artwork: basePayload.artwork_title,
        order_id: basePayload.order_id,
        price: basePayload.price,
      }),
    );
  });
});
