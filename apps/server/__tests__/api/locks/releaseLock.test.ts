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

vi.mock("@omenai/shared-models/models/lock/LockSchema", () => ({
  LockMechanism: { deleteOne: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/locks/releaseLock/route";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { validateRequestBody } from "../../../app/api/util";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/releaseLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/locks/releaseLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(LockMechanism.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);
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

  it("returns 200 with Lock released message on success", async () => {
    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Lock released");
  });

  it("deletes lock by user_id and art_id", async () => {
    await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(LockMechanism.deleteOne).toHaveBeenCalledWith({
      user_id: "user-001",
      art_id: "art-1",
    });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when deleteOne throws", async () => {
    vi.mocked(LockMechanism.deleteOne).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(response.status).toBe(500);
  });
});
