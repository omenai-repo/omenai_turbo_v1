import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema",
  () => ({
    AdminInviteToken: {
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateAlphaDigit: vi.fn().mockReturnValue("mock-token-abc123"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail",
  () => ({
    sendMemberInviteEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/invite_new_member/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/invite_new_member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: "newmember@example.com",
  access_role: "Editor",
};

describe("POST /api/admin/invite_new_member", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
    };
    const mockClient = { startSession: vi.fn().mockResolvedValue(mockSession) };
    vi.mocked(connectMongoDB).mockResolvedValue(mockClient as any);
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);
    vi.mocked(AccountAdmin.create).mockResolvedValue({} as any);
    vi.mocked(AdminInviteToken.create).mockResolvedValue({} as any);
  });

  it("returns 201 when invite is sent successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Invite sent successfully");
    expect(sendMemberInviteEmail).toHaveBeenCalledWith({
      email: validBody.email,
      token: "mock-token-abc123",
    });
  });

  it("creates an AccountAdmin record with email and access_role", async () => {
    await POST(makeRequest(validBody));

    expect(AccountAdmin.create).toHaveBeenCalledWith({
      email: validBody.email,
      access_role: validBody.access_role,
    });
  });

  it("creates an AdminInviteToken with author and generated token", async () => {
    await POST(makeRequest(validBody));

    expect(AdminInviteToken.create).toHaveBeenCalledWith({
      author: validBody.email,
      token: "mock-token-abc123",
    });
  });

  it("does not create account or send email when member already exists", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({
      email: validBody.email,
    });

    await POST(makeRequest(validBody));

    expect(AccountAdmin.create).not.toHaveBeenCalled();
    expect(AdminInviteToken.create).not.toHaveBeenCalled();
    expect(sendMemberInviteEmail).not.toHaveBeenCalled();
  });

  it("returns 403 when email is already associated with a team member", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({
      email: "newmember@example.com",
    });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already associated/i);
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({ access_role: "Editor" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      makeRequest({ email: "not-an-email", access_role: "Editor" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
