import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    find: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/admin/fetch_all_admins/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";

const mockAdmins = [
  {
    admin_id: "admin-1",
    name: "Alice",
    email: "alice@example.com",
    access_role: "Admin",
    verified: true,
    joinedAt: "2024-01-01",
  },
  {
    admin_id: "admin-2",
    name: "Bob",
    email: "bob@example.com",
    access_role: "Editor",
    verified: false,
    joinedAt: null,
  },
];

describe("GET /api/admin/fetch_all_admins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with list of admins", async () => {
    vi.mocked(AccountAdmin.find).mockResolvedValue(mockAdmins as any);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully fetched all admins");
    expect(body.data).toEqual(mockAdmins);
  });

  it("returns 200 with an empty array when no admins exist", async () => {
    vi.mocked(AccountAdmin.find).mockResolvedValue([] as any);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 500 when AccountAdmin.find throws", async () => {
    vi.mocked(AccountAdmin.find).mockRejectedValue(new Error("DB error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
