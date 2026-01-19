import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { ArtworkSchemaTypes, FailedCronJobTypes } from "@omenai/shared-types";
import { fetchImagesInParallel } from "../../../../workflows/deletion/services/upload_service";
import { batchResizeAndUpload } from "../../../../workflows/deletion/utils";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";

export async function cloudinaryService(jobs: FailedCronJobTypes[]) {
  try {
    const artworkIds: string[] = jobs.map((job) => job.payload.appwriteId);
    const artworks = (await Artworkuploads.find({
      url: { $in: artworkIds },
    }).lean()) as unknown as ArtworkSchemaTypes[];
    const artworkUrls: string[] = artworks.map((artwork) => artwork.url);
    const imageMetadata = await fetchImagesInParallel(artworkUrls);
    const { successful = [], failed = [] } =
      await batchResizeAndUpload(imageMetadata);

    if (successful.length > 0) {
      const successfulIds = successful.map(
        (successful) => successful.appwriteId
      );
      await FailedJob.deleteMany({
        jobId: { $in: successfulIds },
      });
    }
    if (failed.length > 0) {
      const failedIds = failed.map((failed) => failed.appwriteId);
      await FailedJob.updateMany(
        { jobId: { $in: failedIds } },
        { $inc: { retryCount: 1 } }
      );
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
