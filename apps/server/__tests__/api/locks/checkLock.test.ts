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

vi.mock("@omenai/shared-models/models/lock/LockSchema", () => ({
  LockMechanism: { findOne: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/locks/checkLock/route";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { validateRequestBody } from "../../../app/api/util";

const mockLock = { art_id: "art-1", user_id: "user-001" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/checkLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/locks/checkLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          throw Object.assign(new Error("Validation Failed"), { name: "BadRequestError" });
        }
        return result.data;
      },
    );
  });

  it("returns 200 locked:false when no lock exists for art", async () => {
    vi.mocked(LockMechanism.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No lock is present");
    expect(body.data.locked).toBe(false);
  });

  it("returns 200 locked:true when lock is held by a different user", async () => {
    vi.mocked(LockMechanism.findOne).mockResolvedValue({ ...mockLock, user_id: "other-user" });

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Lock acquired by another user");
    expect(body.data.locked).toBe(true);
  });

  it("returns 200 locked:false when lock is held by the requesting user", async () => {
    vi.mocked(LockMechanism.findOne).mockResolvedValue(mockLock);

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Lock acquired by current user");
    expect(body.data.locked).toBe(false);
  });

  it("queries by art_id only when checking for active lock", async () => {
    vi.mocked(LockMechanism.findOne).mockResolvedValue(null);

    await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(LockMechanism.findOne).toHaveBeenCalledWith({ art_id: "art-1" });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when findOne throws", async () => {
    vi.mocked(LockMechanism.findOne).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(response.status).toBe(500);
  });
});
