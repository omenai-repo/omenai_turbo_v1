import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock(
  "@omenai/shared-models/models/deletion/DeletionRequestSchema",
  () => ({
    DeletionRequestModel: {
      find: vi.fn(),
      bulkWrite: vi.fn(),
    },
  }),
);

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
  createWorkflowTarget: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/deletion/allocateDeletionTaskToWorker/route";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  verifyAuthVercel,
  createWorkflowTarget,
} from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/deletion/allocateDeletionTaskToWorker",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

function makeFindChain(data: any[]) {
  return {
    limit: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(data),
      }),
    }),
  };
}

const mockTask = {
  requestId: "req-001",
  entityType: "user",
  targetId: "user-001",
  services: ["account_service"],
  targetEmail: "user@example.com",
  gracePeriodUntil: new Date(),
  requestedAt: new Date(),
  initiatedBy: "target" as const,
};

describe("GET /api/cron/deletion/allocateDeletionTaskToWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(DeletionRequestModel.find).mockReturnValue(
      makeFindChain([]) as any,
    );
    vi.mocked(DeletionRequestModel.bulkWrite).mockResolvedValue({
      modifiedCount: 0,
    } as any);
    vi.mocked(createWorkflowTarget).mockResolvedValue("workflow-id-001");
  });

  it("returns 200 with zero counts when no tasks found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.successfulRuns).toBe(0);
    expect(body.failedRuns).toBe(0);
  });

  it("returns 200 with all successes message when workflows are created", async () => {
    vi.mocked(DeletionRequestModel.find)
      .mockReturnValueOnce(makeFindChain([mockTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("All allocations successfully completed");
    expect(body.successfulRuns).toBe(1);
    expect(body.failedRuns).toBe(0);
  });

  it("returns 200 with partial failure message when createWorkflowTarget returns undefined", async () => {
    vi.mocked(DeletionRequestModel.find)
      .mockReturnValueOnce(makeFindChain([mockTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);
    vi.mocked(createWorkflowTarget).mockResolvedValue(undefined);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("Some allocations failed");
    expect(body.failedRuns).toBe(1);
    expect(body.successfulRuns).toBe(0);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("queries DeletionRequestModel with status requested", async () => {
    await GET(makeRequest());
    expect(DeletionRequestModel.find).toHaveBeenCalledWith(
      { status: "requested" },
      expect.any(String),
    );
  });

  it("calls createWorkflowTarget for each task", async () => {
    vi.mocked(DeletionRequestModel.find)
      .mockReturnValueOnce(makeFindChain([mockTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    await GET(makeRequest());

    expect(createWorkflowTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "req-001",
        targetId: "user-001",
        entityType: "user",
      }),
    );
  });

  it("calls bulkWrite with in_progress status for successful workflows", async () => {
    vi.mocked(DeletionRequestModel.find)
      .mockReturnValueOnce(makeFindChain([mockTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    await GET(makeRequest());

    expect(DeletionRequestModel.bulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { requestId: "req-001" },
            update: { $set: { status: "in_progress" } },
          }),
        }),
      ]),
    );
  });

  it("does not call bulkWrite when no tasks are found", async () => {
    await GET(makeRequest());
    expect(DeletionRequestModel.bulkWrite).not.toHaveBeenCalled();
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
});
