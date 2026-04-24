import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    find: vi.fn(),
  },
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/admin/get_galleries_on_verif_status/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockGalleries = [
  {
    gallery_id: "gallery-1",
    name: "Gallery One",
    email: "one@example.com",
    gallery_verified: false,
  },
  {
    gallery_id: "gallery-2",
    name: "Gallery Two",
    email: "two@example.com",
    gallery_verified: true,
  },
];

describe("GET /api/admin/get_galleries_on_verif_status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with galleries data", async () => {
    vi.mocked(AccountGallery.find).mockResolvedValue(mockGalleries as any);

    const response = await GET(
      new Request("http://localhost/api/admin/get_galleries_on_verif_status"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Data retrieved");
    expect(body.data).toEqual(mockGalleries);
  });

  it("returns 500 when AccountGallery.find throws", async () => {
    vi.mocked(AccountGallery.find).mockRejectedValue(new Error("DB error"));

    const response = await GET(
      new Request("http://localhost/api/admin/get_galleries_on_verif_status"),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
