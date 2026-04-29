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

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    deleteOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema",
  () => ({
    AdminInviteToken: {
      deleteOne: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { PUT } from "../../../app/api/admin/delete_member/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/delete_member", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  admin_id: "admin-abc-123",
  email: "admin@example.com",
};

describe("PUT /api/admin/delete_member", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AdminInviteToken.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as any);
    vi.mocked(AccountAdmin.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as any);
  });

  it("returns 200 when team member is deleted", async () => {
    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Team member deleted successfully");
    expect(AdminInviteToken.deleteOne).toHaveBeenCalledWith({
      author: validBody.email,
    });
    expect(AccountAdmin.deleteOne).toHaveBeenCalledWith({
      admin_id: validBody.admin_id,
    });
  });

  it("returns 500 when AccountAdmin.deleteOne deletedCount is 0", async () => {
    vi.mocked(AccountAdmin.deleteOne).mockResolvedValue({
      deletedCount: 0,
    } as any);

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when admin_id is missing", async () => {
    const response = await PUT(makeRequest({ email: "admin@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await PUT(
      makeRequest({ admin_id: "admin-123", email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is missing", async () => {
    const response = await PUT(makeRequest({ admin_id: "admin-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
