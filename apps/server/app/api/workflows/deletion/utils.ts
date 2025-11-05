import cloudinary from "@omenai/cloudinary-config";
import { storage } from "@omenai/appwrite-config";
import { saveFailedJob } from "@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs";
import { handleUploadDeletionProtocol } from "./services/upload_service";
import { DeletionTaskServiceType } from "@omenai/shared-types";
import { purchaseTransactionService } from "./services/purchase_transaction_service";

// apps/server/lib/deletion-utils/deleteFromService.ts
export async function deleteFromService(
  service: DeletionTaskServiceType,
  targetId: string,
  metadata?: Record<string, any>
) {
  switch (service) {
    case "order_service":
      break;
    case "wallet_service":
      break;
    case "account_service":
      break;
    case "subscriptions_service":
      break;
    case "purchase_transaction_service":
      return await purchaseTransactionService(
        targetId,
        metadata as Record<string, any>
      );
    case "misc_service":
      break;
    case "upload_service":
      return await handleUploadDeletionProtocol(targetId);
    case "categorization_service":
      break;
    case "stripe_service":
      break;
    case "sales_service":
      break;
    default:
      throw new Error(`Unsupported service type: ${service}`);
  }
}

export async function uploadToCloudinary(url: string, id: string) {
  try {
    const uploadResult = await cloudinary.uploader.upload(url, {
      folder: "thumbnails",
      transformation: [
        { width: 200, height: 200, crop: "fill", quality: "auto" },
      ],
    });

    return {
      cloudinaryUrl: uploadResult.secure_url,
      appwriteId: id,
    };
  } catch (error: any) {
    console.error(`❌ Error uploading image ${id}:`, error.message);
    // Return failure metadata instead of throwing
    return {
      appwriteId: id,
      reason: error.message || "Unknown error",
      failed: true,
    };
  }
}

// helper to process in limited batches
async function processInBatches<T>(
  items: T[],
  handler: (item: T) => Promise<any>,
  limit = CONCURRENCY_LIMIT
) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => handler(item));
    results.push(p);

    if (limit <= items.length) {
      const e: Promise<any> = p.then(() =>
        executing.splice(executing.indexOf(e), 1)
      );
      executing.push(e);
      if (executing.length >= limit) await Promise.race(executing);
    }
  }

  return Promise.allSettled(results);
}

export async function batchResizeAndUpload(
  images: { id: string; url: string }[]
) {
  const results = await processInBatches(images, (image) =>
    uploadToCloudinary(image.url, image.id)
  );

  const successful = results
    .filter(
      (
        r
      ): r is PromiseFulfilledResult<{
        appwriteId: string;
        cloudinaryUrl?: string;
        failed?: boolean;
        reason?: string;
      }> =>
        r.status === "fulfilled" &&
        !!r.value &&
        !r.value.failed &&
        !!r.value.cloudinaryUrl
    )
    .map((r) => r.value as { cloudinaryUrl: string; appwriteId: string });

  const failed = results
    .filter(
      (
        r
      ): r is PromiseFulfilledResult<{
        appwriteId: string;
        cloudinaryUrl?: string;
        failed?: boolean;
        reason?: string;
      }> =>
        r.status === "fulfilled" &&
        !!r.value &&
        (r.value.failed || !r.value.cloudinaryUrl)
    )
    .map((r) => ({
      appwriteId: r.value.appwriteId,
      reason: r.value.reason || "Upload failed",
    }));

  return { successful, failed };
}

const CONCURRENCY_LIMIT = 10;

export async function deleteFilesInBatches(fileIds: string[]) {
  const executing: Promise<any>[] = [];

  for (const fileId of fileIds) {
    const task = storage
      .deleteFile({ bucketId: process.env.APPWRITE_BUCKET_ID!, fileId })
      .catch((err) => {
        console.error(`❌ Failed to delete file ${fileId}:`, err.message);
        return { failed: true, fileId, reason: err.message };
      });

    executing.push(task);

    if (executing.length >= CONCURRENCY_LIMIT) {
      await Promise.race(executing);
      executing.splice(0, executing.length - CONCURRENCY_LIMIT);
    }
  }

  // Wait for all to finish
  const results = await Promise.allSettled(executing);

  const successful = results
    .filter((r) => r.status === "fulfilled" && !r.value?.failed)
    .map((_, i) => fileIds[i]);

  const failed = results
    .filter(
      (
        r
      ): r is PromiseFulfilledResult<{
        failed: true;
        fileId: string;
        reason: string;
      }> => r.status === "fulfilled" && r.value?.failed
    )
    .map((r) => r.value);

  return { successfulDeletes: successful, failedDeletes: failed };
}

export async function createFailedTaskJob<T>({
  error,
  payload,
  taskId,
  jobType,
}: {
  error: string;
  payload: T;
  taskId: string;
  jobType: string;
}): Promise<boolean> {
  const result: boolean = await saveFailedJob({
    jobId: taskId,
    jobType,
    payload,
    reason: error,
  });

  return result;
}
