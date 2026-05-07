import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../../app/api/requests/artist/verifyOnboardingCompletion/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

function makeRequest(id?: string) {
  const url = `http://localhost/api/requests/artist/verifyOnboardingCompletion${id ? `?id=${id}` : ""}`;
  return { nextUrl: new URL(url) } as any;
}

function mockFindOne(value: object | null) {
  vi.mocked(AccountArtist.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("GET /api/requests/artist/verifyOnboardingCompletion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with onboarding status", async () => {
    mockFindOne({ isOnboardingCompleted: true, artist_verified: true });

    const response = await GET(makeRequest("artist-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Verify Onboarding status");
    expect(body.isOnboardingCompleted).toBe(true);
    expect(body.isArtistVerified).toBe(true);
  });

  it("returns false values when onboarding is incomplete", async () => {
    mockFindOne({ isOnboardingCompleted: false, artist_verified: false });

    const response = await GET(makeRequest("artist-2"));
    const body = await response.json();

    expect(body.isOnboardingCompleted).toBe(false);
    expect(body.isArtistVerified).toBe(false);
  });

  it("returns 404 when artist is not found", async () => {
    mockFindOne(null);

    const response = await GET(makeRequest("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Gallery data not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
