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
  },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/sales/getActivityById/route";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { validateRequestBody } from "../../../app/api/util";

const mockActivities = [
  { id: "gallery-001", year: "2024", month: "April", value: 5000, trans_ref: "txn-1" },
  { id: "gallery-001", year: "2024", month: "March", value: 3000, trans_ref: "txn-2" },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/sales/getActivityById", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/sales/getActivityById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SalesActivity.find).mockResolvedValue(mockActivities as any);
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

  it("returns 200 with activities on success", async () => {
    const response = await POST(makeRequest({ id: "gallery-001", year: "2024" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockActivities);
  });

  it("queries SalesActivity with id and year", async () => {
    await POST(makeRequest({ id: "gallery-001", year: "2024" }));

    expect(SalesActivity.find).toHaveBeenCalledWith({
      id: "gallery-001",
      year: "2024",
    });
  });

  it("returns 200 with empty array when no activities match", async () => {
    vi.mocked(SalesActivity.find).mockResolvedValue([] as any);

    const response = await POST(makeRequest({ id: "gallery-001", year: "2024" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({ year: "2024" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when year is missing", async () => {
    const response = await POST(makeRequest({ id: "gallery-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when SalesActivity.find throws", async () => {
    vi.mocked(SalesActivity.find).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest({ id: "gallery-001", year: "2024" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    const { connectMongoDB } = await import(
      "@omenai/shared-lib/mongo_connect/mongoConnect"
    );
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest({ id: "gallery-001", year: "2024" }));

    expect(response.status).toBe(500);
  });
});
