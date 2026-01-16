import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { FlattenMaps } from "mongoose";
import {
  batchResizeAndUpload,
  createFailedTaskJob,
  deleteFilesInBatches,
  DeletionReturnType,
} from "../utils";

/**
 * Deletion protocol:
 * 1. Fetch all artworks belonging to targetId (paginated)
 * 2. For artworks referenced in orders, create cloudinary thumbnails (with failure retries logged)
 * 3. Delete all artwork records from Artworkuploads (unconditionally)
 * 4. Delete all original files from Appwrite (with failure retries logged)
 * 5. Update any existing orders with new thumbnail URLs
 */
export async function handleUploadDeletionProtocol(
  targetId: string
): Promise<DeletionReturnType> {
  const stats = {
    totalArtworksFetched: 0,
    totalDeletedFromDB: 0,
    totalThumbnailUploads: 0,
    totalAppwriteDeletions: 0,
    totalSuccessfulJobCreations: 0,
    totalFailedJobCreations: 0,
  };
  try {
    if (!targetId) throw new Error("targetId is required");

    const batchSize = 50;
    let page = 0;

    while (true) {
      const artworksQueuedForDeletion = await Artworkuploads.find(
        { author_id: targetId },
        "url"
      )
        .limit(batchSize)
        .skip(batchSize * page)
        .lean();

      if (artworksQueuedForDeletion.length === 0) break;

      const batchResult = await processDeletionBatch(
        artworksQueuedForDeletion,
        targetId
      );

      stats.totalArtworksFetched += artworksQueuedForDeletion.length;
      stats.totalThumbnailUploads += batchResult.successfulThumbnailUploads;
      stats.totalAppwriteDeletions += batchResult.successfulAppwriteDeletions;
      stats.totalSuccessfulJobCreations += batchResult.successfulJobCreations;
      stats.totalFailedJobCreations += batchResult.failedJobCreations;

      page += 1;
      if (artworksQueuedForDeletion.length < batchSize) break;
    }

    // Step 3: Delete all artworks (unconditional)
    const deleteArtworks = await Artworkuploads.deleteMany({
      author_id: targetId,
    });

    stats.totalDeletedFromDB = deleteArtworks.deletedCount;

    return {
      success: true,
      note: "Deletion protocol completed successfully",
      count: { ...stats },
    };
  } catch (err) {
    console.error("handleUploadDeletionProtocol error:", err);
    return {
      success: false,
      note: "Deletion protocol failed",
      count: { ...stats },
      error: (err as Error).message,
    };
  }
}

/**
 * Process a single batch of artworks for a target user.
 */
async function processDeletionBatch(
  artworks: (FlattenMaps<any> &
    Required<{ _id: unknown }> & {
      __v: number;
    })[],
  targetId: string
) {
  const stats = {
    successfulThumbnailUploads: 0,
    successfulAppwriteDeletions: 0,
    successfulJobCreations: 0,
    failedJobCreations: 0,
  };

  try {
    // Step 1: Collect all artwork URLs
    const artworkUrls: string[] = artworks.map((artwork) => artwork.url);

    // Step 2: Find artworks that exist in orders (single efficient query)
    const existingOrderArtworks = await CreateOrder.find(
      { "artwork_data.url": { $in: artworkUrls } },
      { "artwork_data.url": 1 }
    ).lean();

    const existingUrlsSet = new Set(
      existingOrderArtworks.map((doc) => doc.artwork_data.url)
    );

    // Step 2i: Prepare URLs for thumbnail regeneration
    const artworksToRetrieve: string[] = artworks
      .filter((artwork) => existingUrlsSet.has(artwork.url))
      .map((artwork) => artwork.url);

    // Step 3: For artworks in orders → create 200px x 200px Cloudinary thumbnails
    const imageMetadata = await fetchImagesInParallel(artworksToRetrieve);

    const { successful = [], failed = [] } =
      await batchResizeAndUpload(imageMetadata);

    stats.successfulThumbnailUploads = successful.length;

    // Step 4: Delete originals from Appwrite (from all artwork URLs)
    const appwriteIds = artworkUrls;

    const { failedDeletes = [], successfulDeletes = [] } =
      await deleteFilesInBatches(appwriteIds);
    stats.successfulAppwriteDeletions = successfulDeletes.length;

    // Step 5: Update orders with Cloudinary thumbnails
    if (successful.length > 0) {
      const ops = successful.map(({ appwriteId, cloudinaryUrl }) => ({
        updateOne: {
          filter: { "artwork_data.url": appwriteId },
          update: {
            $set: {
              "artwork_data.url": cloudinaryUrl,
              "artwork_data.deletedEntity": true,
            },
          },
        },
      }));

      if (ops.length > 0) await CreateOrder.bulkWrite(ops);
    }

    // Step 6: Record failed operations for cron retries
    const jobTasks: Promise<boolean>[] = [];

    for (const fail of failed) {
      jobTasks.push(
        createFailedTaskJob({
          error: fail.reason || "Unable to upload image to Cloudinary",
          taskId: `upload_service:${fail.appwriteId}`,
          payload: { appwriteId: fail.appwriteId },
          jobType: "upload_artwork_to_cloudinary",
        })
      );
    }

    for (const fail of failedDeletes) {
      jobTasks.push(
        createFailedTaskJob({
          error: fail.reason || "Unable to delete file from Appwrite",
          taskId: `upload_service:${fail.fileId}`,
          payload: { appwriteId: fail.fileId },
          jobType: "delete_artwork_from_appwrite",
        })
      );
    }

    if (jobTasks.length > 0) {
      const results = await Promise.allSettled(jobTasks);
      for (const r of results) {
        if (r.status === "fulfilled") stats.successfulJobCreations++;
        else stats.failedJobCreations++;
      }
    }

    return stats;
  } catch (err) {
    console.error("processDeletionBatch error:", err);
    return stats;
  }
}

export async function fetchImagesInParallel(fileIds: string[]) {
  if (!fileIds.length) return [];
  return fileIds.map((id) => ({
    id,
    url: getImageFileView(id, 200),
  }));
}
