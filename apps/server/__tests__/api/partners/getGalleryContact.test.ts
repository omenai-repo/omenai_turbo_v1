import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

// Unused import in the route file — must be mocked to prevent dependency chain loading
vi.mock("../../../app/api/services/gallery/partners/getGalleryOverview.service", () => ({
  getGalleryOverviewService: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/partners/getGalleryContact/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockGallery = {
  gallery_id: "gallery-1",
  name: "Omenai Gallery",
  address: { street: "1 Art Lane", city: "Lagos" },
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryContact");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockGallery),
    } as any);
  });

  it("returns 200 with gallery contact data on success", async () => {
    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockGallery);
  });

  it("queries AccountGallery with gallery_id and name/address fields", async () => {
    await GET(makeRequest({ id: "gallery-1" }));

    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      "name address",
    );
  });

  it("returns 400 when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Gallery not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });

  it("returns 400 when findOne throws (inline service catches and returns isOk:false)", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Internal Server Error");
  });
});
