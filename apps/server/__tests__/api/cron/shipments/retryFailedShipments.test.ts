import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
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

vi.mock("@omenai/shared-models/models/crons/FailedJob", () => ({
  FailedJob: {
    find: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://localhost:3000"),
}));

vi.mock("p-limit", () => ({
  default: vi.fn().mockReturnValue((fn: () => any) => fn()),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/cron/shipments/retryFailedShipments/route";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/shipments/retryFailedShipments",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

function makePendingJob(overrides: Record<string, any> = {}) {
  return {
    _id: "job-001",
    jobType: "createShipment",
    status: "pending",
    retryCount: 0,
    lastRetryAt: null,
    payload: { order_id: "order-001" },
    ...overrides,
  };
}

describe("GET /api/cron/shipments/retryFailedShipments", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(FailedJob.find).mockResolvedValue([]);
    vi.mocked(FailedJob.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue(""),
    });
    vi.stubGlobal("fetch", mockFetch);
  });

  it("returns 200 with no failed jobs message when no pending jobs exist", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No failed jobs to retry");
    expect(body.processed).toBe(0);
  });

  it("returns 200 with backoff message when jobs are not ready for retry", async () => {
    const recentJob = makePendingJob({ lastRetryAt: new Date() });
    vi.mocked(FailedJob.find).mockResolvedValue([recentJob] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("No jobs ready for retry");
    expect(body.totalPending).toBe(1);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("processes ready jobs and returns successful count", async () => {
    const job = makePendingJob();
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.successful).toBe(1);
    expect(body.failed).toBe(0);
    expect(body.processed).toBe(1);
  });

  it("calls the shipment workflow API endpoint for each job", async () => {
    const job = makePendingJob();
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);

    await GET(makeRequest());

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/workflows/shipment/createShipment",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ order_id: "order-001" }),
      }),
    );
  });

  it("marks successful jobs as reprocessed in the database", async () => {
    const job = makePendingJob({ _id: "job-001" });
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);

    await GET(makeRequest());

    expect(FailedJob.updateOne).toHaveBeenCalledWith(
      { _id: "job-001" },
      { $set: { status: "reprocessed" } },
    );
  });

  it("increments retryCount when API call returns a non-OK response", async () => {
    const job = makePendingJob({ _id: "job-001", retryCount: 1 });
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValue("Server Error"),
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.failed).toBe(1);
    expect(FailedJob.updateOne).toHaveBeenCalledWith(
      { _id: "job-001" },
      expect.objectContaining({ $inc: { retryCount: 1 } }),
    );
  });

  it("marks job as failed_permanently when max retries reached", async () => {
    const job = makePendingJob({ _id: "job-001", retryCount: 4 }); // 4 + 1 = 5 = MAX_RETRIES
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: vi.fn().mockResolvedValue("Bad Request"),
    });

    await GET(makeRequest());

    expect(FailedJob.updateOne).toHaveBeenCalledWith(
      { _id: "job-001" },
      expect.objectContaining({
        $set: expect.objectContaining({ status: "failed_permanently" }),
      }),
    );
  });

  it("handles network errors by incrementing retryCount", async () => {
    const job = makePendingJob({ _id: "job-001" });
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.failed).toBe(1);
    expect(FailedJob.updateOne).toHaveBeenCalledWith(
      { _id: "job-001" },
      expect.objectContaining({ $inc: { retryCount: 1 } }),
    );
  });

  it("returns response with totalPending and readyForRetry metrics", async () => {
    const job = makePendingJob();
    vi.mocked(FailedJob.find).mockResolvedValue([job] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(typeof body.totalPending).toBe("number");
    expect(typeof body.readyForRetry).toBe("number");
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB Error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when FailedJob.find throws", async () => {
    vi.mocked(FailedJob.find).mockRejectedValueOnce(new Error("Query failed"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
