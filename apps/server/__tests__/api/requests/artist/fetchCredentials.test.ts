import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artist/ArtistCategorizationSchema", () => ({
  ArtistCategorization: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../../app/api/requests/artist/fetchCredentials/route";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

function makeRequest(id?: string) {
  const url = `http://localhost/api/requests/artist/fetchCredentials${id ? `?id=${id}` : ""}`;
  return { nextUrl: new URL(url) } as any;
}

describe("GET /api/requests/artist/fetchCredentials", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with credentials and documentation", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      current: { category: "painter", style: "abstract" },
    } as any);
    vi.mocked(AccountArtist.findOne).mockResolvedValue({
      documentation: { passport: "url" },
    } as any);

    const response = await GET(makeRequest("artist-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Credentials retrieved successfully");
    expect(body.credentials).toEqual({ category: "painter", style: "abstract" });
    expect(body.documentation).toEqual({ passport: "url" });
  });

  it("returns 404 when credentials are not found", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/No credentials were found/i);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
