import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema",
  () => ({
    AdminInviteToken: {
      findOne: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/admin/check_admin_activation/route";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";

function makeRequest(token?: string): Request {
  const url = token
    ? `http://localhost/api/admin/check_admin_activation?id=${token}`
    : "http://localhost/api/admin/check_admin_activation";
  return new Request(url, { method: "GET" });
}

describe("GET /api/admin/check_admin_activation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isActive true when invite token exists", async () => {
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue({
      token: "valid-token-abc",
      email: "admin@example.com",
    });

    const response = await GET(makeRequest("valid-token-abc"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isActive).toBe(true);
  });

  it("returns isActive false when invite token does not exist", async () => {
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("expired-token"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isActive).toBe(false);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
