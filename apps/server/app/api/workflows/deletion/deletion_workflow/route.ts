import {
  DeletionAuditLog,
  DeletionTaskServiceType,
  EntityType,
} from "@omenai/shared-types";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";
import { deleteFromService } from "../service_runner";
import {
  createSignature,
  hashEmail,
} from "@omenai/shared-lib/encryption/encrypt_email";
import { DeletionAuditLogModel } from "@omenai/shared-models/models/deletion/DeletionAuditLogSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";

/* ---------------- types ---------------- */

type Payload = {
  services: DeletionTaskServiceType[];
  targetId: string;
  entityType: Exclude<EntityType, "admin">;
  requestId: string;
  targetEmail: string;
  dataRetentionExpiry: Date;
  deletionRequestDate: Date;
  deletionInitiatedBy: "target" | "admin" | "system";
};

type TaskSummary = {
  service: DeletionTaskServiceType;
  status: "complete" | "incomplete";
  note: string;
  deletedRecordSummary: Record<string, any>;
  completedAt: Date;
  error_message?: string;
};

/* ---------------- helpers ---------------- */

function buildServiceOperations(
    services: DeletionTaskServiceType[],
    targetId: string,
    entityType: EntityType,
    requestId: string
) {
  return services.map((service) => ({
    service,
    fn: deleteFromService(service, targetId, { entityType, requestId }),
  }));
}

function normalizeTaskResult(
    service: DeletionTaskServiceType,
    result: PromiseSettledResult<any>
): TaskSummary {
  const completedAt = toUTCDate(new Date());

  if (result.status === "fulfilled") {
    const { success, note, count, error } = result.value;
    const status = success ? "complete" : "incomplete";

    return {
      service,
      status,
      note,
      deletedRecordSummary: count,
      completedAt,
      ...(status !== "complete" && {
        error_message: error || "An error occurred during deletion",
      }),
    };
  }

  return {
    service,
    status: "incomplete",
    note: "The service runner threw an unhandled exception. Manual intervention required",
    deletedRecordSummary: {},
    completedAt,
    error_message:
        (result.reason as Error)?.message || "Unknown error",
  };
}

function buildAuditLog(
    payload: Payload,
    taskSummaries: TaskSummary[]
): Omit<DeletionAuditLog, "signature"> {
  return {
    deletion_request_id: payload.requestId,
    target_ref: {
      target_id: payload.targetId,
      target_email_hash: hashEmail(payload.targetEmail),
    },
    initiated_by: payload.deletionInitiatedBy,
    tasks_summary: taskSummaries,
    requested_at: payload.deletionRequestDate,
    retention_expired_at: payload.dataRetentionExpiry,
  };
}

function signAuditLog(
    auditLog: Omit<DeletionAuditLog, "signature">
) {
  const secretKey = process.env.DATA_DELETION_LOG_SIGNING_KEY;

  if (!secretKey) {
    throw new Error("Server configuration error: Missing signing key.");
  }

  return createSignature(auditLog, secretKey);
}

/* ---------------- workflow ---------------- */

export const { POST } = serve<Payload>(async (ctx) => {
  const payload = ctx.requestPayload;

  await ctx.run("deletion_workflow", async () => {
    await connectMongoDB();

    const serviceOps = buildServiceOperations(
        payload.services,
        payload.targetId,
        payload.entityType,
        payload.requestId
    );

    const results = await Promise.allSettled(
        serviceOps.map((op) => op.fn)
    );

    const taskSummaries = results.map((result, index) =>
        normalizeTaskResult(serviceOps[index].service, result)
    );

    const auditLog = buildAuditLog(payload, taskSummaries);
    const signature = signAuditLog(auditLog);

    await DeletionAuditLogModel.create({
      ...auditLog,
      signature,
    });

    await DeletionRequestModel.updateOne(
        { requestId: payload.requestId },
        { $set: { status: "completed" } }
    );
  });

  return NextResponse.json(
      { data: "Successfully ran deletion workflow" },
      { status: 200 }
  );
});
