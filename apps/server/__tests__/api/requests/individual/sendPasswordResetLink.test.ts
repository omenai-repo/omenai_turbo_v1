import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
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

import { POST } from "../../../../app/api/requests/individual/sendPasswordResetLink/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { sendPasswordRecoveryMail } from "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/individual/sendPasswordResetLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockUser = {
  email: "user@example.com",
  user_id: "user-123",
  name: "Test User",
  verified: true,
};

describe("POST /api/requests/individual/sendPasswordResetLink", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and sends reset link successfully", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUser),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ recoveryEmail: "user@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Password reset link has been sent");
    expect(body.id).toBe("user-123");
  });

  it("returns 404 when email is not associated with any account", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ recoveryEmail: "ghost@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Email is not associated to any account");
  });

  it("returns 403 when account is not verified", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ ...mockUser, verified: false }),
    } as any);

    const response = await POST(makeRequest({ recoveryEmail: "user@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Please verify your account first.");
  });

  it("returns 403 when a token link already exists", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUser),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ author: "user-123" } as any);

    const response = await POST(makeRequest({ recoveryEmail: "user@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/Token link already exists/i);
  });

  it("creates a VerificationCodes token for the user", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUser),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    await POST(makeRequest({ recoveryEmail: "user@example.com" }));

    expect(VerificationCodes.create).toHaveBeenCalledWith(
      expect.objectContaining({ author: "user-123" }),
    );
  });

  it("sends the password recovery email to the user", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUser),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    await POST(makeRequest({ recoveryEmail: "user@example.com" }));

    expect(sendPasswordRecoveryMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" }),
    );
  });

  it("returns 400 when recoveryEmail is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
