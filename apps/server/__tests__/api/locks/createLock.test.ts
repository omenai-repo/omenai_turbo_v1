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
  LockMechanism: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { findOne: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/locks/createLock/route";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { validateRequestBody } from "../../../app/api/util";

const mockLock = { _id: "lock-1", art_id: "art-1", user_id: "user-001" };
const mockArtwork = { art_id: "art-1", availability: true };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/locks/createLock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/locks/createLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Artworkuploads.findOne).mockResolvedValue(mockArtwork as any);
    vi.mocked(LockMechanism.findOne)
      .mockResolvedValueOnce(null)   // first call: no existing lock
      .mockResolvedValueOnce(mockLock); // second call: retrieve created lock
    vi.mocked(LockMechanism.create).mockResolvedValue(mockLock as any);
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

  it("returns 200 with lock data when lock is successfully created", async () => {
    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Purchase Lock acquired");
    expect(body.data.lock_data).toEqual(mockLock);
  });

  it("creates lock with art_id and user_id", async () => {
    await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(LockMechanism.create).toHaveBeenCalledWith({ art_id: "art-1", user_id: "user-001" });
  });

  it("returns 200 with existing lock when another user already holds it", async () => {
    const existingLock = { ...mockLock, user_id: "other-user" };
    vi.mocked(LockMechanism.findOne).mockReset();
    vi.mocked(LockMechanism.findOne).mockResolvedValueOnce(existingLock);

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.lock_data).toEqual(existingLock);
    expect(LockMechanism.create).not.toHaveBeenCalled();
  });

  it("returns 403 when artwork is not available for purchase", async () => {
    vi.mocked(Artworkuploads.findOne).mockResolvedValue({ availability: false } as any);

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(response.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ user_id: "user-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when LockMechanism.create returns falsy", async () => {
    vi.mocked(LockMechanism.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest({ user_id: "user-001", art_id: "art-1" }));

    expect(response.status).toBe(500);
  });
});
