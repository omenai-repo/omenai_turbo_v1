import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock(
  "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail",
  () => ({ sendBuyerShipmentEmail: vi.fn().mockResolvedValue(undefined) }),
);

vi.mock(
  "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail",
  () => ({ sendSellerShipmentEmail: vi.fn().mockResolvedValue(undefined) }),
);

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn((p: number) => `$${p}`),
}));

import { POST } from "../../../../app/api/workflows/emails/sendShipmentEmail/route";
import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";

const shipmentPayload = {
  buyerName: "John Buyer",
  buyerEmail: "buyer@test.com",
  sellerName: "Jane Seller",
  sellerEmail: "seller@test.com",
  trackingCode: "TRK-001",
  externalTrackingCode: "EXT-001",
  courier: "DHL",
  fileContent: "base64content",
  artwork: "Test Artwork",
  artworkImage: "https://example.com/image.jpg",
  artworkPrice: 500,
  artistName: "Jane Artist",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/workflows/emails/sendShipmentEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/workflows/emails/sendShipmentEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends both buyer and seller shipment emails", async () => {
    await POST(makeRequest(shipmentPayload));

    expect(sendBuyerShipmentEmail).toHaveBeenCalledOnce();
    expect(sendSellerShipmentEmail).toHaveBeenCalledOnce();
  });

  it("calls sendBuyerShipmentEmail with correct tracking data", async () => {
    await POST(makeRequest(shipmentPayload));

    expect(sendBuyerShipmentEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: shipmentPayload.buyerEmail,
        name: shipmentPayload.buyerName,
        trackingCode: shipmentPayload.trackingCode,
        externalTrackingCode: shipmentPayload.externalTrackingCode,
        courier: shipmentPayload.courier,
        artwork: shipmentPayload.artwork,
        artistName: shipmentPayload.artistName,
      }),
    );
  });

  it("calls sendSellerShipmentEmail with correct seller data", async () => {
    await POST(makeRequest(shipmentPayload));

    expect(sendSellerShipmentEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: shipmentPayload.sellerEmail,
        name: shipmentPayload.sellerName,
        fileContent: shipmentPayload.fileContent,
        artwork: shipmentPayload.artwork,
        artistName: shipmentPayload.artistName,
      }),
    );
  });

  it("formats artwork price before passing to emails", async () => {
    await POST(makeRequest(shipmentPayload));

    const buyerCall = vi.mocked(sendBuyerShipmentEmail).mock.calls[0][0];
    expect(buyerCall.price).toBe("$500");

    const sellerCall = vi.mocked(sendSellerShipmentEmail).mock.calls[0][0];
    expect(sellerCall.price).toBe("$500");
  });
});
