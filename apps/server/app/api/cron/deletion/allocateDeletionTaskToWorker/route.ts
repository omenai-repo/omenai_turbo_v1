import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { DeletionRequest } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { createWorkflowTarget } from "../utils";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { createErrorRollbarReport } from "../../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const BATCH_SIZE = 10;
  let BATCH_NUMBER = 0;
  const MAX_EXECUTION_TIME = 50_000; // 50 seconds

  try {
    const startTime = Date.now();
    await connectMongoDB();

    let successfulRuns = 0;
    let failedRuns = 0;

    while (true) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > MAX_EXECUTION_TIME) break;

      const deletionTasks = await DeletionRequestModel.find(
        { status: "requested" },
        "requestId services entityType targetId targetEmail initiatedBy requestedAt gracePeriodUntil",
      )
        .limit(BATCH_SIZE)
        .skip(BATCH_NUMBER * BATCH_SIZE)
        .lean();

      if (deletionTasks.length === 0) break;

      const allocationResponse = await processTaskAllocation(deletionTasks);
      successfulRuns += allocationResponse.successfulAllocations;
      failedRuns += allocationResponse.failedWorkflowCreations;

      if (deletionTasks.length < BATCH_SIZE) break;
      BATCH_NUMBER++;
    }

    return NextResponse.json(
      {
        message:
          failedRuns > 0
            ? "Some allocations failed, they will be retried at next cron run"
            : "All allocations successfully completed",
        successfulRuns,
        failedRuns,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
});

async function processTaskAllocation(tasks: DeletionRequest[]): Promise<{
  successfulAllocations: number;
  failedWorkflowCreations: number;
}> {
  try {
    if (!tasks) return { successfulAllocations: 0, failedWorkflowCreations: 0 };
    const workflowPromises: {
      requestId: string;
      fn: Promise<string | undefined>;
    }[] = [];

    // Queue all workflow tasks for creation
    for (const task of tasks) {
      const {
        entityType,
        targetId,
        requestId,
        services,
        targetEmail,
        gracePeriodUntil,
        requestedAt,
        initiatedBy,
      } = task;

      workflowPromises.push({
        requestId,
        fn: createWorkflowTarget({
          targetId,
          requestId,
          entityType,
          services,
          targetEmail,
          dataRetentionExpiry: gracePeriodUntil,
          deletionRequestDate: requestedAt,
          deletionInitiatedBy: initiatedBy,
        }),
      });
    }

    const successfulBulkWriteOps: {
      updateOne: {
        filter: { requestId: string };
        update: { $set: { status: "in_progress" } };
      };
    }[] = [];

    const failedWorkflowCreations: string[] = [];

    // Execute all workflows in parallel
    const results = await Promise.allSettled(
      workflowPromises.map((workflow) => workflow.fn),
    );

    results.forEach((result, i) => {
      const { requestId } = workflowPromises[i];

      if (result.status === "fulfilled" && result.value) {
        successfulBulkWriteOps.push({
          updateOne: {
            filter: { requestId },
            update: { $set: { status: "in_progress" as const } },
          },
        });
      } else {
        failedWorkflowCreations.push(requestId);

        if (result.status === "rejected") {
          console.error(
            `❌ Workflow creation failed for requestId=${requestId}:`,
            result.reason,
          );
        }
      }
    });

    // Perform a single batched update for all successful allocations
    if (successfulBulkWriteOps.length > 0) {
      await DeletionRequestModel.bulkWrite(successfulBulkWriteOps);
    }

    return {
      successfulAllocations: successfulBulkWriteOps.length,
      failedWorkflowCreations: failedWorkflowCreations.length,
    };
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Deletion Task Allocation",
      error,
      error_response?.status,
    );

    return { successfulAllocations: 0, failedWorkflowCreations: 0 };
  }
}
