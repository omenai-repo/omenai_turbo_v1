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
  AccountGallery: { updateOne: vi.fn() },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost"),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/update/gallery/address/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { validateDHLAddress } from "../../../../app/api/util";

const ukAddress = {
  address_line: "1 Gallery Row",
  city: "London",
  country: "UK",
  countryCode: "GB",
  state: "England",
  stateCode: "EN",
  zip: "SW1A",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/gallery/address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/gallery/address", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateDHLAddress).mockResolvedValue(undefined);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when gallery address updated successfully", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-1", address: ukAddress }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Address information updated successfully");
    expect(validateDHLAddress).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "GB" }),
    );
    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      { $set: { address: ukAddress } },
    );
  });

  it("returns 500 when DHL address validation fails", async () => {
    vi.mocked(validateDHLAddress).mockRejectedValue(new Error("Invalid address"));

    const response = await POST(makeRequest({ gallery_id: "gallery-1", address: ukAddress }));

    expect(response.status).toBe(500);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const response = await POST(makeRequest({ address: ukAddress }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when address is missing", async () => {
    const response = await POST(makeRequest({ gallery_id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
