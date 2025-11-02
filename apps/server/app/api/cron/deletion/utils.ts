import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { DeletionTaskModel } from "@omenai/shared-models/models/deletion/DeletionTaskSchema";
import { EntityType } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { LeanDeletionRequest } from "./createDeletionTasks/route";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

export const DELETION_TASK_SERVICES = [
  "order_service",
  "upload_service",
  "wallet_service",
  "purchase_transaction_service",
  "account_service",
  "subscriptions_service",
  "stripe_service",
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
    "stripe_service",
    "account_service",
    "sales_service",
    "misc_service",
  ],
};

export async function createDeletionTaskPerService(
  task: DeletionTaskServiceType,
  requestId: string,
  metadata: Record<string, string | Exclude<EntityType, "admin">>
) {
  const entityId = metadata.entityId as string;
  const entityType = metadata.entityType as Exclude<EntityType, "admin">;
  const idempotencyKey = `${task}:${entityId}:${entityType}`;

  const createTask = await DeletionTaskModel.create({
    requestId,
    service: task,
    entityId,
    entityType,
    idempotencyKey,
  });

  return createTask._id;
}

export async function pollExpiredDeletionRequests(batch_size: number) {
  const now = toUTCDate(new Date());
  const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes

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
      "requestId entityType targetId"
    )
      .limit(batch_size)
      .lean<LeanDeletionRequest[]>()
      .sort({ createdAt: -1 });

  return deletionRequestsWithExpiredGracePeriod;
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
  const workflowID = await createWorkflow(
    `/api/workflows/deletion/deletion_workflow`,
    `test_workflow${generateDigit(2)}`,
    JSON.stringify(metadata)
  );

  return workflowID;
}

export function isDeletionTaskServiceType(
  value: unknown
): value is DeletionTaskServiceType {
  return (
    typeof value === "string" &&
    DELETION_TASK_SERVICES.includes(value as DeletionTaskServiceType)
  );
}
