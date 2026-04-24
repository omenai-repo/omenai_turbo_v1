import { describe, it, expect, vi, beforeEach } from "vitest";

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
    findOne: vi.fn(),
  },
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateGetRouteParams: vi.fn().mockImplementation((schema: any, data: any) => {
      const result = schema.safeParse(data);
      if (!result.success) throw new BadRequestError("Invalid URL parameters");
      return data;
    }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { GET } from "../../../../app/api/requests/gallery/fetchProfile/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockGallery = {
  gallery_id: "gallery-123",
  name: "Test Gallery",
  logo: "https://example.com/logo.png",
  address: { city: "New York" },
  email: "gallery@example.com",
  description: "A fine art gallery",
  admin: "John Doe",
};

function makeGetRequest(id?: string): unknown {
  const url = `http://localhost/api/requests/gallery/fetchProfile${id ? `?id=${id}` : ""}`;
  return { nextUrl: new URL(url) };
}

function mockFindOne(value: typeof mockGallery | null) {
  vi.mocked(AccountGallery.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("GET /api/requests/gallery/fetchProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with gallery profile data", async () => {
    mockFindOne(mockGallery);

    const response = await GET(makeGetRequest("gallery-123") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.gallery.name).toBe("Test Gallery");
    expect(body.gallery.email).toBe("gallery@example.com");
    expect(body.gallery.admin).toBe("John Doe");
  });

  it("does not expose sensitive fields", async () => {
    mockFindOne(mockGallery);

    const response = await GET(makeGetRequest("gallery-123") as any);
    const body = await response.json();

    expect(body.gallery.password).toBeUndefined();
    expect(body.gallery.gallery_id).toBeUndefined();
  });

  it("returns 404 when gallery is not found", async () => {
    mockFindOne(null);

    const response = await GET(makeGetRequest("nonexistent") as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Gallery data not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeGetRequest() as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
