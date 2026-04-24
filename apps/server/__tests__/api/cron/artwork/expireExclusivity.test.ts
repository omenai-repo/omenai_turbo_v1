import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    find: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    bulkWrite: vi.fn(),
  },
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/artwork/expireExclusivity/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/artwork/expireExclusivity",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockContracts = [{ art_id: "art-001" }, { art_id: "art-002" }];

describe("GET /api/cron/artwork/expireExclusivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(Artworkuploads.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockContracts),
    } as any);
    vi.mocked(Artworkuploads.bulkWrite).mockResolvedValue({
      modifiedCount: 2,
    } as any);
    vi.mocked(CreateOrder.bulkWrite).mockResolvedValue({
      modifiedCount: 3,
    } as any);
  });

  it("returns 200 with updated counts when contracts are found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Exclusivity contracts updated successfully");
    expect(body.artworksUpdated).toBe(2);
    expect(body.ordersUpdated).toBe(3);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before querying", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("returns 200 with no-op message when no expired contracts found", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No expired contracts found");
  });

  it("does not call bulkWrite when no contracts are found", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    await GET(makeRequest());

    expect(Artworkuploads.bulkWrite).not.toHaveBeenCalled();
    expect(CreateOrder.bulkWrite).not.toHaveBeenCalled();
  });

  it("runs artwork and order bulkWrite in parallel", async () => {
    await GET(makeRequest());

    expect(Artworkuploads.bulkWrite).toHaveBeenCalledOnce();
    expect(CreateOrder.bulkWrite).toHaveBeenCalledOnce();
  });

  it("returns error status when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));
    vi.mocked(handleErrorEdgeCases).mockReturnValueOnce({
      status: 403,
      message: "Forbidden",
    });

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB Error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when Artworkuploads.find throws", async () => {
    vi.mocked(Artworkuploads.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("Query failed")),
    } as any);

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("builds correct bulkWrite ops for each expired contract", async () => {
    await GET(makeRequest());

    const artworkOps = vi.mocked(Artworkuploads.bulkWrite).mock.calls[0][0];
    expect(artworkOps).toHaveLength(2);
    expect(artworkOps[0]).toMatchObject({
      updateOne: {
        filter: { art_id: "art-001" },
        update: {
          $set: { "exclusivity_status.exclusivity_type": "non-exclusive" },
        },
      },
    });
  });
});
