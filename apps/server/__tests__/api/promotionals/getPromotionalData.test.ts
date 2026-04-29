import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/promotionals/PromotionalSchema", () => ({
  PromotionalModel: {
    find: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/promotionals/getPromotionalData/route";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockPromos = [
  { _id: "promo-1", headline: "Art Basel", createdAt: "2024-04-01" },
  { _id: "promo-2", headline: "Lagos Art Week", createdAt: "2024-03-01" },
];

function setupFindChain(docs: any[]) {
  vi.mocked(PromotionalModel.find).mockReturnValue({
    sort: vi.fn().mockResolvedValue(docs),
  } as any);
}

describe("GET /api/promotionals/getPromotionalData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFindChain(mockPromos);
  });

  it("returns 200 with promotional data on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Promotional data retreived");
    expect(body.data).toEqual(mockPromos);
  });

  it("sorts by createdAt in descending order", async () => {
    await GET();

    const sortMock = (vi.mocked(PromotionalModel.find).mock.results[0].value as any).sort;
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("returns 200 with empty array when no promotionals exist", async () => {
    setupFindChain([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 500 when PromotionalModel.find throws", async () => {
    vi.mocked(PromotionalModel.find).mockReturnValue({
      sort: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
