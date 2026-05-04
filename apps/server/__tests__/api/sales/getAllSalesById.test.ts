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

vi.mock("@omenai/shared-models/models/sales/SalesActivity", () => ({
  SalesActivity: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/sales/getAllSalesById/route";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { validateRequestBody } from "../../../app/api/util";

const mockSales = [{ _id: "sale-1" }, { _id: "sale-2" }, { _id: "sale-3" }];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/sales/getAllSalesById", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setupFindChain(docs: any[]) {
  vi.mocked(SalesActivity.find).mockReturnValue({
    exec: vi.fn().mockResolvedValue(docs),
  } as any);
}

describe("POST /api/sales/getAllSalesById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFindChain(mockSales);
    vi.mocked(SalesActivity.countDocuments).mockResolvedValue(3);
    vi.mocked(validateRequestBody).mockImplementation(
      async (request: Request, schema: any) => {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw Object.assign(new Error(`Validation Failed: ${msg}`), {
            name: "BadRequestError",
          });
        }
        return result.data;
      },
    );
  });

  it("returns 200 with sales data and count on success", async () => {
    const response = await POST(makeRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockSales);
    expect(body.count).toBe(3);
  });

  it("queries SalesActivity.find with id and _id projection", async () => {
    await POST(makeRequest({ id: "gallery-001" }));

    expect(SalesActivity.find).toHaveBeenCalledWith({ id: "gallery-001" }, "_id");
  });

  it("queries SalesActivity.countDocuments with id", async () => {
    await POST(makeRequest({ id: "gallery-001" }));

    expect(SalesActivity.countDocuments).toHaveBeenCalledWith({ id: "gallery-001" });
  });

  it("returns count of 0 when no sales exist", async () => {
    setupFindChain([]);
    vi.mocked(SalesActivity.countDocuments).mockResolvedValue(0);

    const response = await POST(makeRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.count).toBe(0);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it("returns 500 when SalesActivity.find throws", async () => {
    vi.mocked(SalesActivity.find).mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await POST(makeRequest({ id: "gallery-001" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when SalesActivity.countDocuments throws", async () => {
    vi.mocked(SalesActivity.countDocuments).mockRejectedValue(
      new Error("Count failed"),
    );

    const response = await POST(makeRequest({ id: "gallery-001" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    const { connectMongoDB } = await import(
      "@omenai/shared-lib/mongo_connect/mongoConnect"
    );
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest({ id: "gallery-001" }));

    expect(response.status).toBe(500);
  });
});
