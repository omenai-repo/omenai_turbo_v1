import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
    findOne: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: vi.fn().mockResolvedValue(undefined),
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

import { POST } from "../../../../app/api/requests/individual/verifyMail/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/individual/verifyMail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/requests/individual/verifyMail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when verification is successful", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ verified: false }),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ code: "tok1234", author: "user-123" }),
    } as any);

    const response = await POST(makeRequest({ params: "user-123", token: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Verification was successful. Please login");
  });

  it("returns 403 when account is already verified", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ verified: true }),
    } as any);

    const response = await POST(makeRequest({ params: "user-123", token: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already verified/i);
  });

  it("returns 400 when token is invalid", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ verified: false }),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ params: "user-123", token: "badtoken" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid token data");
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ params: "user-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
