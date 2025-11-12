import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { serverStorage } from "@omenai/appwrite-config";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { saveFailedJob } from "@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs";
import { redis } from "@omenai/upstash-config";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { art_id } = await request.json();

    const artwork = await Artworkuploads.findOne({ art_id }, "url").exec();

    if (!artwork) throw new NotFoundError("Artwork not found");

    const deleteArtwork = await Artworkuploads.deleteOne({ art_id }).exec();

    if (deleteArtwork.deletedCount === 0) {
      throw new ServerError(
        "We're having some trouble performing your request at this time. Please try again later or contact support"
      );
    }

    await serverStorage
      .deleteFile({
        bucketId: process.env.APPWRITE_BUCKET_ID!,
        fileId: artwork.url,
      })
      .catch(async (err) => {
        console.error(`❌ Failed to delete file ${artwork.url}:`, err.message);
        await saveFailedJob({
          jobId: `artwork:${art_id}`,
          jobType: "delete_artwork_from_appwrite",
          payload: { appwriteId: artwork.url },
          reason: err.message,
        });
      });

    await redis.del(`artwork:${art_id}`);

    return NextResponse.json(
      {
        message: "Artwork successfully deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status }
    );
  }
});
