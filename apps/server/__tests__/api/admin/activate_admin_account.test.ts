import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/hash/hashPassword", () => ({
  hashPassword: vi.fn().mockResolvedValue("$2b$10$hashedpassword"),
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema",
  () => ({
    AdminInviteToken: {
      findOne: vi.fn(),
      deleteOne: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/admin/sendAdminActivationEmail",
  () => ({
    sendAdminActivationEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/admin/activate_admin_account/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { sendAdminActivationEmail } from "@omenai/shared-emails/src/models/admin/sendAdminActivationEmail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/activate_admin_account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "John Admin",
  password: "SecureP@ss123",
  token: "invite-token-abc",
  email: "admin@example.com",
};

describe("POST /api/admin/activate_admin_account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({
      email: "admin@example.com",
    });
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue({
      token: "invite-token-abc",
      author: "admin@example.com",
    });
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(AdminInviteToken.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as any);
  });

  it("returns 200 when account is successfully activated", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toMatch(/Account successfully activated/i);
    expect(sendAdminActivationEmail).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
    });
  });

  it("calls AccountAdmin.updateOne with verified: true and the hashed password", async () => {
    await POST(makeRequest(validBody));

    expect(AccountAdmin.updateOne).toHaveBeenCalledWith(
      { email: validBody.email },
      expect.objectContaining({
        $set: expect.objectContaining({
          password: "$2b$10$hashedpassword",
          name: validBody.name,
          verified: true,
          admin_active: true,
        }),
      }),
    );
  });

  it("deletes the invite token after successful activation", async () => {
    await POST(makeRequest(validBody));

    expect(AdminInviteToken.deleteOne).toHaveBeenCalledWith({
      token: validBody.token,
    });
  });

  it("does not send activation email when admin account is not found", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);

    await POST(makeRequest(validBody));

    expect(sendAdminActivationEmail).not.toHaveBeenCalled();
  });

  it("does not delete token or send email when update fails", async () => {
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    await POST(makeRequest(validBody));

    expect(AdminInviteToken.deleteOne).not.toHaveBeenCalled();
    expect(sendAdminActivationEmail).not.toHaveBeenCalled();
  });

  it("returns 403 when admin account does not exist", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/Unauthorized/i);
  });

  it("returns 403 when email does not match admin email", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({
      email: "different@example.com",
    });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(403);
  });

  it("returns 403 when invite token is not found", async () => {
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/Invalid invitation code/i);
  });

  it("returns 500 when account update modifiedCount is 0", async () => {
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });

  it("returns 400 when email is missing", async () => {
    const { email, ...bodyWithoutEmail } = validBody;
    const response = await POST(makeRequest(bodyWithoutEmail));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when password is missing", async () => {
    const { password, ...bodyWithoutPassword } = validBody;
    const response = await POST(makeRequest(bodyWithoutPassword));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
