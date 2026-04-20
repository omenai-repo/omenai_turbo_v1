import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { generateGhostArtistStub } from "@omenai/shared-lib/auth/generateGhostArtist";

import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { addDaysToDate } from "@omenai/shared-utils/src/addDaysToDate";
import { redis } from "@omenai/upstash-config";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { CombinedConfig, ExclusivityUpholdStatus } from "@omenai/shared-types";

import {
  UploadArtworkInput,
  UploadArtworkSchema,
} from "@omenai/shared-lib/upload/uploadArtwork.schema";

import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  ServiceUnavailableError,
  ForbiddenError,
  ServerError,
} from "../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport } from "../util";

type UploadArtworkResult = {
  message: string;
  artwork: any;
};

export async function uploadArtworkLogic(
  rawData: unknown,
): Promise<UploadArtworkResult> {
  const isArtworkUploadEnabled =
    (await fetchConfigCatValue("artwork_upload_enabled", "high")) ?? false;

  if (!isArtworkUploadEnabled) {
    throw new ServiceUnavailableError("Artwork upload is currently disabled");
  }

  // Parses rawData, ensuring artist_id is present and newGhostArtistName is allowed
  const data: UploadArtworkInput = UploadArtworkSchema.parse(rawData);

  await connectMongoDB();

  const { role_access, title, newGhostArtistName, artist_id } = data;

  let finalArtistId = artist_id;

  if (role_access.role === "gallery") {
    const active_subscription = await Subscriptions.findOne(
      { "customer.gallery_id": data.author_id },
      "plan_details status upload_tracker",
    );

    if (!active_subscription || active_subscription.status !== "active") {
      throw new ForbiddenError(
        "No active subscription for this user. Please activate a plan to continue",
      );
    }

    if (
      active_subscription.upload_tracker.upload_count >=
      active_subscription.upload_tracker.limit
    ) {
      throw new ForbiddenError(
        "Plan usage limit exceeded, please upgrade plan",
      );
    }
  }

  // ==========================================
  // NEW GHOST ARTIST LOGIC
  // ==========================================
  if (role_access.role === "gallery" && newGhostArtistName) {
    const ghostPayload = generateGhostArtistStub(newGhostArtistName);

    // Create the Ghost Artist
    const newGhostArtist = await AccountArtist.create(ghostPayload);

    if (!newGhostArtist) {
      throw new ServerError(
        "Failed to generate artist profile, please try again",
      );
    }

    finalArtistId = newGhostArtist.artist_id;

    // Add to gallery's roster seamlessly
    await AccountGallery.updateOne(
      { gallery_id: data.author_id },
      { $addToSet: { represented_artists: finalArtistId } },
    );
  }
  // ==========================================

  const new_title = trimWhiteSpace(title);

  const exclusivity_status: Pick<
    ExclusivityUpholdStatus,
    "exclusivity_type" | "exclusivity_end_date" | "order_auto_rejection_count"
  > = {
    exclusivity_type: role_access.role === "artist" ? "exclusive" : null,
    exclusivity_end_date:
      role_access.role === "artist" ? addDaysToDate(90) : null,
    order_auto_rejection_count: 0,
  };

  // Construct payload, injecting the correct finalArtistId
  // and excluding the temporary newGhostArtistName variable
  const payload = {
    ...data,
    artist_id: finalArtistId, // Replaces 'artist' with 'artist_id'
    title: new_title,
    exclusivity_status,
  };

  // Clean up the payload so Mongoose doesn't try to save a non-existent field
  delete (payload as any).newGhostArtistName;

  const uploadArt = await Artworkuploads.create(payload);

  if (!uploadArt) {
    throw new ServerError("A server error has occurred, please try again");
  }

  if (data.role_access.role === "gallery") {
    const update_tracker = await Subscriptions.updateOne(
      { "customer.gallery_id": data.author_id },
      { $inc: { "upload_tracker.upload_count": 1 } },
    );

    if (update_tracker.modifiedCount === 0) {
      await Artworkuploads.deleteOne({ _id: uploadArt._id });

      throw new ServerError(
        "A server error has occurred, please try again or contact support",
      );
    }
  }

  const cacheKey = `artwork:${uploadArt.art_id}`;

  try {
    await redis.set(cacheKey, JSON.stringify(uploadArt));
  } catch (redisWriteErr) {
    createErrorRollbarReport(
      "artwork: Redis Write Error",
      redisWriteErr as any,
      500,
    );
  }

  return {
    message: "Artwork uploaded successfully",
    artwork: uploadArt,
  };
}
