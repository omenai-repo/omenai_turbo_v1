import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-emails/src/models/admin/sendRoleChangeMail", () => ({
  sendRoleChangeMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }

  return {
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { PUT } from "../../../app/api/admin/edit_member_role/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { sendRoleChangeMail } from "@omenai/shared-emails/src/models/admin/sendRoleChangeMail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/edit_member_role", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAdmin = {
  name: "John Admin",
  email: "admin@example.com",
  access_role: "Editor",
};

describe("PUT /api/admin/edit_member_role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(mockAdmin);
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when role is updated successfully", async () => {
    const response = await PUT(
      makeRequest({ admin_id: "admin-123", role: "Admin" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Team member role updated successfully");
    expect(sendRoleChangeMail).toHaveBeenCalledWith({
      name: mockAdmin.name,
      previousRole: mockAdmin.access_role,
      newRole: "Admin",
      email: mockAdmin.email,
    });
  });

  it("returns 500 when modifiedCount is 0", async () => {
    vi.mocked(AccountAdmin.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await PUT(
      makeRequest({ admin_id: "admin-123", role: "Admin" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("No changes made or admin not found");
  });

  it("returns 400 when admin_id is missing", async () => {
    const response = await PUT(makeRequest({ role: "Admin" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when role is missing", async () => {
    const response = await PUT(makeRequest({ admin_id: "admin-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when role is an empty string", async () => {
    const response = await PUT(makeRequest({ admin_id: "admin-123", role: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
