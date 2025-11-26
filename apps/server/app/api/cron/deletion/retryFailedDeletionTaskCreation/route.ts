import { DeletionTaskServiceType } from "@omenai/shared-types";
import { FlattenMaps, ObjectId, Schema } from "mongoose";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedDeletionTaskModel } from "@omenai/shared-models/models/deletion/FailedDeletionTaskSchema";
import { createDeletionTaskPerService } from "../utils";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport } from "../../../util";

interface ReponseMetadata {
  entityId: string;
  requestId: string;
  service: DeletionTaskServiceType;
}

const MAX_EXECUTION_TIME = 50000;
export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const startTime = Date.now();
  let successfulTasks = 0;
  let failedTasks = 0;

  try {
    await connectMongoDB();

    let batchNumber = 0;

    while (true) {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > MAX_EXECUTION_TIME) {
        break;
      }

      console.log(`Processing batch ${batchNumber}`);

      const allFailedDeletionTaskCreation = await FailedDeletionTaskModel.find()
        .limit(10)
        .skip(10 * batchNumber)
        .lean();

      if (allFailedDeletionTaskCreation.length === 0) break;

      const batchProcessResult = await processBatch(
        allFailedDeletionTaskCreation
      );

      const { successfulOps, failedOps } = batchProcessResult;

      successfulTasks += successfulOps.length;
      failedTasks += failedOps.length;

      batchNumber++;

      if (allFailedDeletionTaskCreation.length < 10) break;
    }
    return NextResponse.json({
      message:
        failedTasks > 0
          ? "Some failed deletions weren't completed, next cron run will pick those up"
          : "Cron ran successfully",
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Deletion task retry for failed creations",
      error,
      error_response?.status
    );

    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status }
    );
  }
});

async function processBatch(
  allFailedDeletionTaskCreation: (FlattenMaps<any> &
    Required<{
      _id: unknown;
    }> & {
      __v: number;
    })[]
) {
  const retryOps: {
    metadata: ReponseMetadata;
    retryFn: Promise<ObjectId>;
  }[] = [];

  for (const failedTaskCreation of allFailedDeletionTaskCreation) {
    const { requestId, service, entityId, entityType, key } =
      failedTaskCreation;

    //   Retry creation
    const retryFn = createDeletionTaskPerService(service, requestId, {
      entityId,
      entityType,
    }) as Promise<ObjectId>;

    const metadata = { requestId, service, entityId };

    retryOps.push({ metadata, retryFn });
  }
  const responses = await Promise.allSettled(retryOps.map((op) => op.retryFn));

  let successfulOps: Schema.Types.ObjectId[] = [];
  let failedOps: ReponseMetadata[] = [];

  const deleteRecordBulkWrites: {
    deleteOne: { filter: Record<string, string> };
  }[] = [];
  const updateRecordBulkWrites: {
    updateOne: {
      filter: Record<string, string>;
      update: { $push: { tasks: { $each: Schema.Types.ObjectId } } };
    };
  }[] = [];

  responses.forEach((response, index) => {
    const { metadata } = retryOps[index];
    const { requestId, entityId, service } = metadata;

    if (response.status === "fulfilled") {
      const deleteRecordBulkOps = {
        deleteOne: {
          filter: { entityId, service, requestId },
        },
      };

      const updateDeleteRequestRecordBulkOps = {
        updateOne: {
          filter: { requestId },
          update: {
            $push: { tasks: { $each: response.value } },
          },
        },
      };

      successfulOps.push(response.value);
      deleteRecordBulkWrites.push(deleteRecordBulkOps);
      updateRecordBulkWrites.push(updateDeleteRequestRecordBulkOps);
    } else {
      failedOps.push(metadata);
    }
  });

  if (deleteRecordBulkWrites.length > 0)
    await FailedDeletionTaskModel.bulkWrite(deleteRecordBulkWrites);

  if (updateRecordBulkWrites.length > 0)
    await DeletionRequestModel.bulkWrite(updateRecordBulkWrites);

  return {
    successfulOps,
    failedOps,
  };
}
