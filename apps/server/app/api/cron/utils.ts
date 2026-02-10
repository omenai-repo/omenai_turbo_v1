import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { DeletionTaskModel } from "@omenai/shared-models/models/deletion/DeletionTaskSchema";
import { EntityType } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { LeanDeletionRequest } from "./deletion/createDeletionTasks/route";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import {
  BadRequestError,
  ServerError,
} from "../../../custom/errors/dictionary/errorDictionary";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { getApiUrl } from "@omenai/url-config/src/config";
import { createErrorRollbarReport } from "../util";

export const DELETION_TASK_SERVICES = [
  "order_service",
  "upload_service",
  "wallet_service",
  "purchase_transaction_service",
  "account_service",
  "subscriptions_service",
  "sales_service",
  "categorization_service",
  "misc_service",
] as const;

type DeletionTaskServiceType = (typeof DELETION_TASK_SERVICES)[number];

export const serviceMap: Record<
  Exclude<EntityType, "admin">,
  DeletionTaskServiceType[]
> = {
  user: [
    "order_service",
    "purchase_transaction_service",
    "account_service",
    "misc_service",
  ],
  artist: [
    "order_service",
    "wallet_service",
    "categorization_service",
    "upload_service",
    "account_service",
    "sales_service",
    "misc_service",
  ],
  gallery: [
    "order_service",
    "subscriptions_service",
    "upload_service",
    "account_service",
    "sales_service",
    "misc_service",
  ],
};

export async function createDeletionTaskPerService(
  task: DeletionTaskServiceType,
  requestId: string,
  metadata: Record<string, string | Exclude<EntityType, "admin">>,
) {
  const entityId = metadata.entityId as string;
  const entityType = metadata.entityType as Exclude<EntityType, "admin">;
  const idempotencyKey = `${task}:${entityId}:${entityType}`;

  try {
    const createTask = await DeletionTaskModel.create({
      requestId,
      service: task,
      entityId,
      entityType,
      idempotencyKey,
    });

    return createTask._id;
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    if (error_response?.status && error_response.status >= 500) {
      if (error instanceof ServerError) {
        rollbarServerInstance.error(error, {
          context: "Cron: Creation of Deletion Task",
        });
      } else {
        rollbarServerInstance.error(new Error(String(error)));
      }
    }
  }
}

export async function pollExpiredDeletionRequests(batch_size: number) {
  const now = toUTCDate(new Date());
  const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes

  try {
    const deletionRequestsWithExpiredGracePeriod: LeanDeletionRequest[] =
      await DeletionRequestModel.find(
        {
          gracePeriodUntil: { $lte: now },
          $or: [
            { status: "requested" },
            // Recover stale "processing" records (crashed runs)
            {
              status: "processing",
              startedAt: { $lt: staleThreshold },
            },
          ],
          entityType: { $ne: "admin" },
        },
        "requestId entityType targetId",
      )
        .limit(batch_size)
        .lean<LeanDeletionRequest[]>()
        .sort({ createdAt: -1 });

    return deletionRequestsWithExpiredGracePeriod;
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    if (error_response?.status && error_response.status >= 500) {
      if (error instanceof ServerError) {
        rollbarServerInstance.error(error, {
          context: "Cron: Deletion Requests Polling",
        });
      } else {
        rollbarServerInstance.error(new Error(String(error)));
      }
    }
  }
}

export async function createWorkflowTarget(metadata: {
  services: DeletionTaskServiceType[];
  entityType: Exclude<EntityType, "admin">;
  targetId: string;
  requestId: string;
  targetEmail: string;
  dataRetentionExpiry: Date;
  deletionRequestDate: Date;
  deletionInitiatedBy: "target" | "admin" | "system";
}): Promise<string | undefined> {
  try {
    const workflowID = await createWorkflow(
      `/api/workflows/deletion/deletion_workflow`,
      `deletion_workflow${generateDigit(2)}`,
      JSON.stringify(metadata),
    );

    return workflowID;
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    if (error_response?.status && error_response.status >= 500) {
      if (error instanceof ServerError) {
        rollbarServerInstance.error(error, {
          context: "Cron: Creation of Deletion Workflow",
        });
      } else {
        rollbarServerInstance.error(new Error(String(error)));
      }
    }
  }
}

export function isDeletionTaskServiceType(
  value: unknown,
): value is DeletionTaskServiceType {
  return (
    typeof value === "string" &&
    DELETION_TASK_SERVICES.includes(value as DeletionTaskServiceType)
  );
}

export async function verifyAuthVercel(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function retrieveTrackingResult(order_id: string) {
  try {
    const response = await fetch(
      `${getApiUrl()}/api/shipment/shipment_tracking?order_id=${order_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    );

    if (!response.ok) {
      throw new Error(`API fetch failed with status ${response.status}`);
    }

    const trackingResult = await response.json();
    return trackingResult;
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Retrieve shipment tracking data",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
}
