import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue({
    startSession: vi.fn().mockResolvedValue({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      abortTransaction: vi.fn().mockResolvedValue(undefined),
      endSession: vi.fn(),
    }),
  }),
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/requests/artist/verifyMail/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/artist/verifyMail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockArtistFindOne(value: { verified: boolean } | null) {
  vi.mocked(AccountArtist.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

function mockCodeFindOne(value: any) {
  vi.mocked(VerificationCodes.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("POST /api/requests/artist/verifyMail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when verification is successful", async () => {
    mockArtistFindOne({ verified: false });
    mockCodeFindOne({ code: "tok1234", author: "artist-123" });

    const response = await POST(makeRequest({ params: "artist-123", token: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Verification was successful. Please login");
  });

  it("returns 403 when account is already verified", async () => {
    mockArtistFindOne({ verified: true });

    const response = await POST(makeRequest({ params: "artist-123", token: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already verified/i);
  });

  it("returns 400 when token is invalid", async () => {
    mockArtistFindOne({ verified: false });
    mockCodeFindOne(null);

    const response = await POST(makeRequest({ params: "artist-123", token: "badtoken" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid token data");
  });

  it("returns 400 when params field is missing", async () => {
    const response = await POST(makeRequest({ token: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when token field is missing", async () => {
    const response = await POST(makeRequest({ params: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
