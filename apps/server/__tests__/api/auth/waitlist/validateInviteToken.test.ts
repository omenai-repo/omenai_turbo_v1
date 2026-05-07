import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { exists: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { exists: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-lib/encryption/encrypt_token", () => ({
  hashPayloadToken: vi.fn().mockReturnValue("correct-hash"),
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/auth/waitlist/validateInviteToken/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";

function makeRequest(body: object) {
  return new Request("http://localhost/api/auth/waitlist/validateInviteToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  email: "alice@example.com",
  entity: "gallery" as const,
  inviteCode: "INV123",
  referrerKey: "correct-hash",
};

describe("POST /api/auth/waitlist/validateInviteToken", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when token is valid", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ referrerKey: "correct-hash" }),
      }),
    } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully validated waitlist user");
  });

  it("returns 403 when user is already registered", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue({ _id: "existing" } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already part of the Omenai/i);
  });

  it("returns 404 when waitlist user is not found", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      }),
    } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/does not exist/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ email: "alice@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when entity is invalid", async () => {
    const response = await POST(makeRequest({ ...validPayload, entity: "user" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("uses AccountArtist model when entity is artist", async () => {
    vi.mocked(AccountArtist.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ referrerKey: "correct-hash" }),
      }),
    } as any);

    await POST(makeRequest({ ...validPayload, entity: "artist" }));

    expect(AccountArtist.exists).toHaveBeenCalledWith({ email: "alice@example.com" });
  });
});
