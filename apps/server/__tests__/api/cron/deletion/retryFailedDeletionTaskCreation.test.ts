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
  "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema",
  () => ({
    FailedDeletionTaskModel: {
      find: vi.fn(),
      bulkWrite: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/deletion/DeletionRequestSchema",
  () => ({
    DeletionRequestModel: {
      bulkWrite: vi.fn(),
    },
  }),
);

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
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

vi.mock(
  "../../../../custom/errors/dictionary/errorDictionary",
  () => ({
    ServerError: class ServerError extends Error {},
  }),
);

import { GET } from "../../../../app/api/cron/deletion/retryFailedDeletionTaskCreation/route";
import { FailedDeletionTaskModel } from "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  verifyAuthVercel,
  createDeletionTaskPerService,
} from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/deletion/retryFailedDeletionTaskCreation",
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

const mockFailedTask = {
  requestId: "req-001",
  service: "account_service",
  entityId: "entity-001",
  entityType: "user",
  key: "account_service:entity-001:user",
};

describe("GET /api/cron/deletion/retryFailedDeletionTaskCreation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(FailedDeletionTaskModel.find).mockReturnValue(
      makeFindChain([]) as any,
    );
    vi.mocked(FailedDeletionTaskModel.bulkWrite).mockResolvedValue({
      deletedCount: 0,
    } as any);
    vi.mocked(DeletionRequestModel.bulkWrite).mockResolvedValue({
      modifiedCount: 0,
    } as any);
    vi.mocked(createDeletionTaskPerService).mockResolvedValue(
      "task-id-001" as any,
    );
  });

  it("returns 200 with success message when no failed tasks", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Cron ran successfully");
  });

  it("returns 200 with success message when all retries succeed", async () => {
    vi.mocked(FailedDeletionTaskModel.find)
      .mockReturnValueOnce(makeFindChain([mockFailedTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Cron ran successfully");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("calls createDeletionTaskPerService for each failed task", async () => {
    vi.mocked(FailedDeletionTaskModel.find)
      .mockReturnValueOnce(makeFindChain([mockFailedTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    await GET(makeRequest());

    expect(createDeletionTaskPerService).toHaveBeenCalledWith(
      "account_service",
      "req-001",
      { entityId: "entity-001", entityType: "user" },
    );
  });

  it("deletes succeeded tasks from FailedDeletionTaskModel via bulkWrite", async () => {
    vi.mocked(FailedDeletionTaskModel.find)
      .mockReturnValueOnce(makeFindChain([mockFailedTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    await GET(makeRequest());

    expect(FailedDeletionTaskModel.bulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          deleteOne: {
            filter: {
              entityId: "entity-001",
              service: "account_service",
              requestId: "req-001",
            },
          },
        }),
      ]),
    );
  });

  it("updates DeletionRequestModel with new task ids on success", async () => {
    vi.mocked(FailedDeletionTaskModel.find)
      .mockReturnValueOnce(makeFindChain([mockFailedTask]) as any)
      .mockReturnValue(makeFindChain([]) as any);

    await GET(makeRequest());

    expect(DeletionRequestModel.bulkWrite).toHaveBeenCalled();
  });

  it("returns error response when verifyAuthVercel throws", async () => {
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

  it("returns 500 when FailedDeletionTaskModel.find throws", async () => {
    vi.mocked(FailedDeletionTaskModel.find).mockReturnValue({
      limit: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          lean: vi.fn().mockRejectedValue(new Error("Query failed")),
        }),
      }),
    } as any);

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
