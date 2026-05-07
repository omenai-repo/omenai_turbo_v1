import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/workflows/deletion/service_runner", () => ({
  deleteFromService: vi.fn().mockResolvedValue({
    success: true,
    note: "Deleted successfully",
    count: { records: 1 },
  }),
}));

vi.mock("@omenai/shared-lib/encryption/encrypt_email", () => ({
  hashEmail: vi.fn().mockReturnValue("hashed-email"),
  createSignature: vi.fn().mockReturnValue("audit-signature"),
}));

vi.mock("@omenai/shared-models/models/deletion/DeletionAuditLogSchema", () => ({
  DeletionAuditLogModel: { create: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@omenai/shared-models/models/deletion/DeletionRequestSchema", () => ({
  DeletionRequestModel: {
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

import { POST } from "../../../../app/api/workflows/deletion/deletion_workflow/route";
import { deleteFromService } from "../../../../app/api/workflows/deletion/service_runner";
import { DeletionAuditLogModel } from "@omenai/shared-models/models/deletion/DeletionAuditLogSchema";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";

const validPayload = {
  services: ["account_service", "order_service"],
  targetId: "user-123",
  entityType: "individual",
  requestId: "req-abc",
  targetEmail: "user@example.com",
  dataRetentionExpiry: new Date("2026-01-01").toISOString(),
  deletionRequestDate: new Date("2025-01-01").toISOString(),
  deletionInitiatedBy: "target",
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/deletion/deletion_workflow",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/deletion/deletion_workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATA_DELETION_LOG_SIGNING_KEY = "test-signing-key";
  });

  it("returns 200 with success message", async () => {
    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe("Successfully ran deletion workflow");
  });

  it("runs deleteFromService for each requested service", async () => {
    await POST(makeRequest(validPayload));

    expect(deleteFromService).toHaveBeenCalledTimes(2);
    expect(deleteFromService).toHaveBeenCalledWith(
      "account_service",
      validPayload.targetId,
      expect.objectContaining({ entityType: validPayload.entityType }),
    );
    expect(deleteFromService).toHaveBeenCalledWith(
      "order_service",
      validPayload.targetId,
      expect.objectContaining({ requestId: validPayload.requestId }),
    );
  });

  it("creates an audit log with signature after all services run", async () => {
    await POST(makeRequest(validPayload));

    expect(DeletionAuditLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deletion_request_id: validPayload.requestId,
        initiated_by: validPayload.deletionInitiatedBy,
        signature: "audit-signature",
      }),
    );
  });

  it("marks deletion request as completed", async () => {
    await POST(makeRequest(validPayload));

    expect(DeletionRequestModel.updateOne).toHaveBeenCalledWith(
      { requestId: validPayload.requestId },
      { $set: { status: "completed" } },
    );
  });

  it("returns 500 when signing key is missing", async () => {
    delete process.env.DATA_DELETION_LOG_SIGNING_KEY;

    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(500);
  });

  it("includes task summaries in audit log when a service fails", async () => {
    vi.mocked(deleteFromService).mockResolvedValueOnce({
      success: false,
      note: "Service failed",
      count: {},
      error: "DB error",
    });

    await POST(makeRequest(validPayload));

    const createCall = vi.mocked(DeletionAuditLogModel.create).mock.calls[0][0];
    const failedTask = createCall.tasks_summary.find(
      (t: any) => t.status === "incomplete",
    );
    expect(failedTask).toBeDefined();
    expect(failedTask.service).toBe("account_service");
  });
});
