import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/RejectedGalleryScema", () => ({
  RejectedGallery: {
    create: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    deleteOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistRejectionMail",
  () => ({
    sendArtistRejectedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/reject_artist_verification/route";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { sendArtistRejectedMail } from "@omenai/shared-emails/src/models/artist/sendArtistRejectionMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/reject_artist_verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  artist_id: "artist-123",
  name: "Test Artist",
  email: "artist@example.com",
};

describe("POST /api/admin/reject_artist_verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(RejectedGallery.create).mockResolvedValue({ name: "Test Artist", email: "artist@example.com" } as any);
    vi.mocked(AccountArtist.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);
  });

  it("returns 200 when artist verification is rejected", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Artist verification rejected");
    expect(sendArtistRejectedMail).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
    });
  });

  it("calls RejectedGallery.create with name and email", async () => {
    await POST(makeRequest(validBody));

    expect(RejectedGallery.create).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
    });
  });

  it("calls AccountArtist.deleteOne with the artist_id", async () => {
    await POST(makeRequest(validBody));

    expect(AccountArtist.deleteOne).toHaveBeenCalledWith({
      artist_id: validBody.artist_id,
    });
  });

  it("does not delete artist or send email when create fails", async () => {
    vi.mocked(RejectedGallery.create).mockResolvedValue(null as any);

    await POST(makeRequest(validBody));

    expect(AccountArtist.deleteOne).not.toHaveBeenCalled();
    expect(sendArtistRejectedMail).not.toHaveBeenCalled();
  });

  it("returns 500 when RejectedGallery.create returns falsy", async () => {
    vi.mocked(RejectedGallery.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const { artist_id, ...rest } = validBody;
    const response = await POST(makeRequest(rest));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      makeRequest({ ...validBody, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when name is missing", async () => {
    const { name, ...rest } = validBody;
    const response = await POST(makeRequest(rest));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
