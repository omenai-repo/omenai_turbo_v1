import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    find: vi.fn(),
  },
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/admin/get_artist_on_verif_status/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

const mockArtists = [
  {
    artist_id: "artist-1",
    name: "Alice",
    email: "alice@example.com",
    artist_verified: false,
  },
  {
    artist_id: "artist-2",
    name: "Bob",
    email: "bob@example.com",
    artist_verified: true,
  },
];

describe("GET /api/admin/get_artist_on_verif_status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with artists on verification status", async () => {
    vi.mocked(AccountArtist.find).mockResolvedValue(mockArtists as any);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Data retrieved");
    expect(body.data).toEqual(mockArtists);
  });

  it("returns 500 when AccountArtist.find throws", async () => {
    vi.mocked(AccountArtist.find).mockRejectedValue(new Error("DB error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
