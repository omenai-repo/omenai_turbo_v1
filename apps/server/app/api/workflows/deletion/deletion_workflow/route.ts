import { DeletionTaskServiceType, EntityType } from "@omenai/shared-types";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";
import { deleteFromService } from "../utils";
import { DeletionAuditLogModel } from "@omenai/shared-models/models/deletion/DeletionAuditLogSchema";

// Map the payload of the expected data here
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
export const { POST } = serve<Payload>(async (ctx) => {
  // Retrieve the payload here for use within your runs
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

  // Implement your workflow logic within ctx.run
  await ctx.run("sample_workflow_run", async () => {
    const serviceOps: { meta: Record<string, any>; fn: Promise<unknown> }[] =
      [];

    for (const service of services) {
      serviceOps.push({
        meta: { targetId, entityType, requestId },
        fn: deleteFromService(service, targetId, { entityType, requestId }),
      });
    }

    let successfulDeletions = [];
    let failedDeletions = [];

    const result = await Promise.allSettled(serviceOps.map((op) => op.fn));

    result.forEach((item, index) => {
      const { targetId } = serviceOps[index].meta;
      if (item.status === "fulfilled") {
        successfulDeletions.push({ targetId, entityType, requestId });
      } else {
        failedDeletions.push({ targetId, entityType, requestId });
      }
    });

    if (failedDeletions.length > 0) {
      // NOTE: Start recovery methods or retry mechanisms
    } else {
      // NOTE: Within this block, all deletion service task ran successfully, now we can create the Audit log and update DeleteRequest document
    }
  });

  return NextResponse.json({ data: "Successful" }, { status: 200 });
});
