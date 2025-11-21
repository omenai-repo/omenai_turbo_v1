// Note: Run this job every day in staging, and every 15 minutes in prod
import { ObjectId } from "mongoose";
import {
  EntityType,
  DeletionTaskServiceType,
  DeletionRequest,
} from "@omenai/shared-types";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { FailedDeletionTaskModel } from "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema";
import {
  createDeletionTaskPerService,
  pollExpiredDeletionRequests,
  serviceMap,
} from "../utils";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport } from "../../../util";

export type LeanDeletionRequest = Pick<
  DeletionRequest,
  "requestId" | "entityType" | "targetId"
> & { _id: ObjectId };

interface TaskCreationOp {
  task: Promise<ObjectId>;
  requestId: string;
  metadata: {
    service: DeletionTaskServiceType;
    entityId: string;
    entity: Exclude<EntityType, "admin">;
  };
}

interface BatchResult {
  processedRequests: number;
  successfulTaskCreations: number;
  failedTaskCreations: number;
  failedRequestIds: string[];
}

// Batch configuration
const BATCH_SIZE = 10; // Note: Increase this number as Omenai scales
const MAX_EXECUTION_TIME = 55000; // 55 seconds

// Core Processing Logic

async function processBatch(
  deletionRequests: LeanDeletionRequest[]
): Promise<BatchResult> {
  const taskCreationOps: TaskCreationOp[] = [];

  // Build all task creation operations for this batch
  for (const deletionRequest of deletionRequests) {
    const { requestId, entityType, targetId } = deletionRequest;

    const key = entityType as Exclude<EntityType, "admin">;

    const services = serviceMap[key];

    // Defensive check
    if (!services) {
      console.warn(`No services found for entityType: ${key}, skipping.`);
      continue;
    }

    for (const service of services) {
      const serviceTask = createDeletionTaskPerService(service, requestId, {
        entityId: targetId,
        entityType: key,
      }) as Promise<ObjectId>;

      taskCreationOps.push({
        task: serviceTask,
        requestId,
        metadata: { service, entity: key, entityId: targetId },
      });
    }
  }

  // Execute all task creations in parallel
  const taskResults = await Promise.allSettled(
    taskCreationOps.map((op) => op.task)
  );

  const successfulUpdates: { requestId: string; createdTaskId: ObjectId }[] =
    [];
  const failedUpdates: TaskCreationOp[] = [];

  taskResults.forEach((result, i) => {
    const { requestId } = taskCreationOps[i];

    if (result.status === "fulfilled") {
      successfulUpdates.push({
        requestId,
        createdTaskId: result.value,
      });
    } else {
      // Log the specific error from the promise
      console.error(
        `Failed to create task for requestId ${requestId} (service: ${taskCreationOps[i].metadata.service}):`,
        result.reason
      );
      failedUpdates.push(taskCreationOps[i]);
    }
  });

  // Update deletion requests with created task IDs
  if (successfulUpdates.length > 0) {
    const groupedRequestIds: Record<string, ObjectId[]> = {};

    for (const update of successfulUpdates) {
      const { requestId, createdTaskId } = update;
      if (!groupedRequestIds[requestId]) groupedRequestIds[requestId] = [];
      groupedRequestIds[requestId].push(createdTaskId);
    }

    const bulkOps = Object.entries(groupedRequestIds).map(
      ([requestId, taskIds]) => ({
        updateOne: {
          filter: { requestId },
          update: {
            $push: { tasks: { $each: taskIds } },
            $set: { status: "tasks_created" },
          },
        },
      })
    );

    if (bulkOps.length > 0) {
      await DeletionRequestModel.bulkWrite(bulkOps);
    }
  }

  // Log failed task creations and add them to failed collections
  if (failedUpdates.length > 0) {
    console.error(`Batch had ${failedUpdates.length} failed task creations`);

    await FailedDeletionTaskModel.insertMany(
      failedUpdates.map(({ requestId, metadata }) => ({
        requestId,
        service: metadata.service,
        entityId: metadata.entityId,
        entityType: metadata.entity,
        key: `${metadata.service}:${metadata.entityId}:${metadata.entity}`,
        error: "MongoDB could not create this task at inception",
      }))
    );
  }

  return {
    processedRequests: deletionRequests.length,
    successfulTaskCreations: successfulUpdates.length,
    failedTaskCreations: failedUpdates.length,
    failedRequestIds: [...new Set(failedUpdates.map((f) => f.requestId))],
  };
}

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const startTime = Date.now();

  try {
    await connectMongoDB();

    // Verify cron authorization
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let totalProcessedRequests = 0;
    let totalSuccessfulTasks = 0;
    let totalFailedTasks = 0;

    const allFailedRequestIds: string[] = [];

    let batchNumber = 0;

    while (true) {
      // Check if we're approaching execution time limit
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > MAX_EXECUTION_TIME) {
        console.warn(
          `Stopping batch processing: approaching execution time limit (${elapsedTime}ms elapsed)`
        );
        break;
      }

      batchNumber++;

      console.log(`Processing batch ${batchNumber}...`);

      // Fetch next batch of expired requests
      const expiredRequests = (await pollExpiredDeletionRequests(
        BATCH_SIZE
      )) as LeanDeletionRequest[];

      // No more requests to process
      if (expiredRequests.length === 0) {
        console.log("No more expired deletion requests to process");
        break;
      }

      const requestIds = expiredRequests.map((r) => r.requestId);

      await DeletionRequestModel.updateMany(
        { requestId: { $in: requestIds } },
        {
          $set: {
            status: "processing",
            startedAt: toUTCDate(new Date()),
          },
        }
      );

      console.log(
        `Batch ${batchNumber}: Processing ${expiredRequests.length} requests`
      );
      // Process this batch
      const batchResult = await processBatch(expiredRequests);

      // Aggregate results
      totalProcessedRequests += batchResult.processedRequests;
      totalSuccessfulTasks += batchResult.successfulTaskCreations;
      totalFailedTasks += batchResult.failedTaskCreations;
      allFailedRequestIds.push(...batchResult.failedRequestIds);

      console.log(
        `Batch ${batchNumber} complete: ${batchResult.successfulTaskCreations} successful, ${batchResult.failedTaskCreations} failed`
      );

      // If we got fewer requests than BATCH_SIZE, we've processed everything
      if (expiredRequests.length < BATCH_SIZE) {
        console.log("Processed all available requests");
        break;
      }
    }

    const executionTime = Date.now() - startTime;

    console.log(
      `Deletion task processing complete in ${executionTime}ms: ` +
        `${totalProcessedRequests} requests, ${totalSuccessfulTasks} successful tasks, ${totalFailedTasks} failed tasks`
    );

    // Return appropriate status code
    const hasFailures = totalFailedTasks > 0;

    return NextResponse.json(
      {
        message: hasFailures
          ? "Deletion task processing completed with some failures"
          : "Deletion task processing completed successfully",
        executionTimeMs: executionTime,
        batchesProcessed: batchNumber,
        processedRequests: totalProcessedRequests,
        successfulTaskCreations: totalSuccessfulTasks,
        failedTaskCreations: totalFailedTasks,
        failedRequestIds: [...new Set(allFailedRequestIds)],
      },
      { status: hasFailures ? 207 : 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Deletion Task Creation",
      error,
      error_response?.status
    );

    return NextResponse.json(
      {
        message: error_response?.message || "Internal Server Error",
        error: "Critical failure in deletion task processing",
      },
      { status: error_response?.status || 500 }
    );
  }
});
