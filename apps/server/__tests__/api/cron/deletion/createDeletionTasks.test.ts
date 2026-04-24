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

vi.mock(
  "@omenai/shared-models/models/deletion/DeletionRequestSchema",
  () => ({
    DeletionRequestModel: {
      find: vi.fn(),
      updateMany: vi.fn(),
      bulkWrite: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/deletion/DeletionTaskSchema",
  () => ({
    DeletionTaskModel: {
      create: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema",
  () => ({
    FailedDeletionTaskModel: {
      insertMany: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
  pollExpiredDeletionRequests: vi.fn(),
  serviceMap: {
    user: ["order_service", "purchase_transaction_service", "account_service", "misc_service"],
    artist: ["order_service", "wallet_service", "categorization_service", "upload_service", "account_service", "sales_service", "misc_service"],
    gallery: ["order_service", "subscriptions_service", "upload_service", "account_service", "sales_service", "misc_service"],
  },
  createDeletionTaskPerService: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/deletion/createDeletionTasks/route";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { DeletionTaskModel } from "@omenai/shared-models/models/deletion/DeletionTaskSchema";
import { FailedDeletionTaskModel } from "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  verifyAuthVercel,
  pollExpiredDeletionRequests,
  createDeletionTaskPerService,
} from "../../../../app/api/cron/utils";

const CRON_SECRET = "test-cron-secret";

function makeRequest(secret = CRON_SECRET): Request {
  return new Request(
    "http://localhost/api/cron/deletion/createDeletionTasks",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
    },
  );
}

const mockDeletionRequest = {
  requestId: "req-001",
  entityType: "user",
  targetId: "user-001",
  _id: "doc-001",
};

describe("GET /api/cron/deletion/createDeletionTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    // mockReset clears the once-mock queue so leftover once-mocks don't bleed between tests
    vi.mocked(pollExpiredDeletionRequests).mockReset().mockResolvedValue([]);
    vi.mocked(createDeletionTaskPerService).mockReset();
    vi.mocked(DeletionRequestModel.updateMany).mockResolvedValue({
      modifiedCount: 0,
    } as any);
    vi.mocked(DeletionRequestModel.bulkWrite).mockResolvedValue({
      modifiedCount: 0,
    } as any);
    vi.mocked(FailedDeletionTaskModel.insertMany).mockResolvedValue([] as any);
  });

  it("returns 200 with summary when no requests to process", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe(
      "Deletion task processing completed successfully",
    );
    expect(body.processedRequests).toBe(0);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("returns 401 when Authorization header is missing or wrong", async () => {
    const response = await GET(makeRequest("wrong-secret"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("processes a batch of deletion requests", async () => {
    vi.mocked(pollExpiredDeletionRequests)
      .mockResolvedValueOnce([mockDeletionRequest] as any)
      .mockResolvedValueOnce([]);

    const mockTaskId = { toString: () => "task-id-001" };
    vi.mocked(createDeletionTaskPerService).mockResolvedValue(mockTaskId as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processedRequests).toBe(1);
  });

  it("marks requests as processing before batch execution", async () => {
    vi.mocked(pollExpiredDeletionRequests)
      .mockResolvedValueOnce([mockDeletionRequest] as any)
      .mockResolvedValueOnce([]);

    vi.mocked(createDeletionTaskPerService).mockResolvedValue({} as any);

    await GET(makeRequest());

    expect(DeletionRequestModel.updateMany).toHaveBeenCalledWith(
      { requestId: { $in: ["req-001"] } },
      expect.objectContaining({ $set: expect.objectContaining({ status: "processing" }) }),
    );
  });

  it("updates DeletionRequestModel with created task ids on success", async () => {
    vi.mocked(pollExpiredDeletionRequests)
      .mockResolvedValueOnce([mockDeletionRequest] as any)
      .mockResolvedValueOnce([]);

    vi.mocked(createDeletionTaskPerService).mockResolvedValue("task-id-001" as any);

    await GET(makeRequest());

    expect(DeletionRequestModel.bulkWrite).toHaveBeenCalled();
  });

  it("does not call FailedDeletionTaskModel.insertMany when createDeletionTaskPerService throws (error propagates to catch block)", async () => {
    vi.mocked(pollExpiredDeletionRequests)
      .mockResolvedValueOnce([mockDeletionRequest] as any);

    vi.mocked(createDeletionTaskPerService).mockRejectedValue(
      new Error("Unexpected DB error"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
    expect(FailedDeletionTaskModel.insertMany).not.toHaveBeenCalled();
  });

  it("returns 200 when createDeletionTaskPerService returns undefined (handles its own errors internally)", async () => {
    vi.mocked(pollExpiredDeletionRequests)
      .mockResolvedValueOnce([mockDeletionRequest] as any);

    vi.mocked(createDeletionTaskPerService).mockResolvedValue(undefined as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.failedTaskCreations).toBe(0);
  });

  it("includes executionTimeMs and batchesProcessed in response", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(typeof body.executionTimeMs).toBe("number");
    expect(typeof body.batchesProcessed).toBe("number");
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when pollExpiredDeletionRequests throws", async () => {
    vi.mocked(pollExpiredDeletionRequests).mockRejectedValueOnce(
      new Error("Poll failed"),
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
