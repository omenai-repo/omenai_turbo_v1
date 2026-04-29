import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/hash/hashPassword", () => ({
  hashPassword: vi.fn().mockResolvedValue("$2b$10$newhashed"),
}));

vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { PUT } from "../../../app/api/admin/update_admin_credentials/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import bcrypt from "bcrypt";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/update_admin_credentials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAccount = {
  admin_id: "admin-abc-123",
  password: "$2b$10$currenthashed",
};

const validBody = {
  admin_id: "admin-abc-123",
  current_password: "OldP@ss123",
  password: "NewP@ss456",
};

describe("PUT /api/admin/update_admin_credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(mockAccount);
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when password is updated successfully", async () => {
    vi.mocked(bcrypt.compareSync)
      .mockReturnValueOnce(true)   // isOldPasswordMatch
      .mockReturnValueOnce(false); // isPasswordMatch (new != old)

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Admin credentials updated successfully");
  });

  it("returns 400 when admin account is not found", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Admin account not found/i);
  });

  it("returns 409 when current password is incorrect", async () => {
    vi.mocked(bcrypt.compareSync)
      .mockReturnValueOnce(false)  // isOldPasswordMatch fails
      .mockReturnValueOnce(false); // isPasswordMatch

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/Current password is incorrect/i);
  });

  it("returns 409 when new password is the same as old password", async () => {
    vi.mocked(bcrypt.compareSync)
      .mockReturnValueOnce(true)  // isOldPasswordMatch
      .mockReturnValueOnce(true); // isPasswordMatch (same password)

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/cannot be identical/i);
  });

  it("returns 409 when updateOne modifiedCount is 0", async () => {
    vi.mocked(bcrypt.compareSync)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
  });

  it("returns 400 when current_password is missing", async () => {
    const { current_password, ...rest } = validBody;
    const response = await PUT(makeRequest(rest));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when password is missing", async () => {
    const { password, ...rest } = validBody;
    const response = await PUT(makeRequest(rest));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
