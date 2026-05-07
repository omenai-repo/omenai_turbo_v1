import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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

import { PUT } from "../../../app/api/admin/update_admin_profile/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/update_admin_profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  admin_id: "admin-abc-123",
  name: "Updated Name",
};

describe("PUT /api/admin/update_admin_profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({ admin_id: "admin-abc-123" });
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when profile is updated successfully", async () => {
    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toMatch(/Admin credentials updated successfully/i);
  });

  it("returns 400 when admin is not found", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);

    const response = await PUT(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Admin account not found/i);
  });

  it("returns 409 when modifiedCount is 0", async () => {
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await PUT(makeRequest(validBody));

    expect(response.status).toBe(409);
  });

  it("returns 400 when name is missing", async () => {
    const response = await PUT(makeRequest({ admin_id: "admin-abc-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when admin_id is missing", async () => {
    const response = await PUT(makeRequest({ name: "New Name" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
