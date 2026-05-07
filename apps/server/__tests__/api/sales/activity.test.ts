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
    create: vi.fn(),
  },
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/sales/activity/route";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockSalesData = {
  month: "April",
  year: "2024",
  value: 5000,
  id: "gallery-001",
  trans_ref: "txn-abc-123",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/sales/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/sales/activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SalesActivity.create).mockResolvedValue(mockSalesData as any);
  });

  it("returns 200 with success message when sales data is created", async () => {
    const response = await POST(makeRequest(mockSalesData));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Sales data added");
  });

  it("passes request body directly to SalesActivity.create", async () => {
    await POST(makeRequest(mockSalesData));

    expect(SalesActivity.create).toHaveBeenCalledWith(
      expect.objectContaining(mockSalesData),
    );
  });

  it("returns 500 when SalesActivity.create returns falsy", async () => {
    vi.mocked(SalesActivity.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(mockSalesData));

    expect(response.status).toBe(500);
  });

  it("returns 500 when SalesActivity.create throws", async () => {
    vi.mocked(SalesActivity.create).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(mockSalesData));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(makeRequest(mockSalesData));

    expect(response.status).toBe(500);
  });
});
