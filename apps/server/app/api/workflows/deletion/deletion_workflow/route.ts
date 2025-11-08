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

export const { POST } = serve<Payload>(async (ctx) => {
  const payload: Payload = ctx.requestPayload;
  const {
    services,
    targetId,
    entityType,
    requestId,
    targetEmail,
    dataRetentionExpiry,
    deletionRequestDate,
    deletionInitiatedBy,
  } = payload;

  await ctx.run("deletion_workflow", async () => {
    await connectMongoDB();
    const serviceOps = services.map((service) => ({
      meta: { targetId, entityType, requestId, service },
      fn: deleteFromService(service, targetId, { entityType, requestId }),
    }));

    const results = await Promise.allSettled(serviceOps.map((op) => op.fn));

    // 1. Create ONE array to hold all task summaries
    const taskSummaries: TaskSummary[] = [];

    results.forEach((item, index) => {
      const { service } = serviceOps[index].meta;
      const completedAt = toUTCDate(new Date());

      if (item.status === "fulfilled") {
        const { success, note, count, error } = item.value;
        console.log(count);
        const status = success ? "complete" : "incomplete";

        taskSummaries.push({
          service,
          status,
          note,
          deletedRecordSummary: count,
          completedAt,
          ...(status !== "complete" && {
            error_message: error || "An error occurred during deletion",
          }),
        });
      } else {
        // This else block will never be hit as all functions are configured to return a positive response. But we log just in case
        taskSummaries.push({
          service,
          status: "incomplete",
          note: "The service runner threw an unhandled exception. Manual intervention required",
          completedAt,
          deletedRecordSummary: {},
          error_message: (item.reason as Error)?.message || "Unknown error",
        });
      }
    });

    // 3. Create ONE master audit log document
    const deletionLog: Omit<DeletionAuditLog, "signature"> = {
      deletion_request_id: requestId,
      target_ref: {
        target_id: targetId,
        target_email_hash: hashEmail(targetEmail),
      },
      initiated_by: deletionInitiatedBy,
      tasks_summary: taskSummaries,
      requested_at: deletionRequestDate,
      retention_expired_at: dataRetentionExpiry,
    };

    // 4. Load your REAL key from a secret manager (NOT process.env)
    const secretKey = process.env.DATA_DELETION_LOG_SIGNING_KEY;
    if (!secretKey) {
      throw new Error("Server configuration error: Missing signing key.");
    }

    const signature = createSignature(deletionLog, secretKey);

    // 6. Create the final log and insert it
    const finalAuditLog = {
      ...deletionLog,
      signature,
    };

    await DeletionAuditLogModel.create(finalAuditLog);
    await DeletionRequestModel.updateOne(
      { requestId },
      { $set: { status: "completed" } }
    );
  });

  return NextResponse.json(
    { data: "Successfully ran deletion workflow" },
    { status: 200 }
  );
});
