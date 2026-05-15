import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1234567"),
}));
vi.mock("@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail", () => ({
  sendPasswordRecoveryMail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/requests/artist/sendPasswordResetLink/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { sendPasswordRecoveryMail } from "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/artist/sendPasswordResetLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockArtist = {
  email: "artist@example.com",
  artist_id: "artist-123",
  name: "Test Artist",
  verified: true,
};

describe("POST /api/requests/artist/sendPasswordResetLink", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and sends reset link successfully", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ recoveryEmail: "artist@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Password reset link has been sent");
    expect(body.id).toBe("artist-123");
  });

  it("returns 404 when email is not associated with any account", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ recoveryEmail: "ghost@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Email is not associated to any account");
  });

  it("returns 403 when account is not verified", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ ...mockArtist, verified: false }),
    } as any);

    const response = await POST(makeRequest({ recoveryEmail: "artist@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Please verify your account first.");
  });

  it("returns 403 when a token link already exists", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ author: "artist-123" } as any);

    const response = await POST(makeRequest({ recoveryEmail: "artist@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/Token link already exists/i);
  });

  it("creates a VerificationCodes token for the artist", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    await POST(makeRequest({ recoveryEmail: "artist@example.com" }));

    expect(VerificationCodes.create).toHaveBeenCalledWith(
      expect.objectContaining({ author: "artist-123" }),
    );
  });

  it("sends the password recovery email to the artist", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    await POST(makeRequest({ recoveryEmail: "artist@example.com" }));

    expect(sendPasswordRecoveryMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "artist@example.com" }),
    );
  });

  it("returns 400 when recoveryEmail is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
