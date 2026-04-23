import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { validateRequestBody } from "../../util";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["user"],
};

const FollowerSchema = z.object({
  followerId: z.string(),
  followingId: z.string(),
  followingType: z.enum(["artist", "gallery"]),
});

export const DELETE = async function DELETE(req: NextRequest) {
  try {
    const { followerId, followingId, followingType } =
      await validateRequestBody(req, FollowerSchema);

    // 1. Attempt to find and delete the follow relationship
    const deletedFollow = await Follow.deleteOne({
      follower: followerId,
      followingId: followingId,
      followingType: followingType,
    });

    // If no document was deleted, they weren't following in the first place.
    // We exit early so we don't artificially lower the counters.
    if (!deletedFollow) {
      return NextResponse.json(
        { error: "Not currently following" },
        { status: 404 },
      );
    }

    // 2. Decrement the followed entity's counter
    if (followingType === "gallery") {
      await AccountGallery.updateOne(
        { gallery_id: followingId },
        {
          $inc: { followerCount: -1 },
        },
      );
    } else if (followingType === "artist") {
      await AccountArtist.updateOne(
        { artist_id: followingId },
        {
          $inc: { followerCount: -1 },
        },
      );
    }

    // 3. Decrement the user's following counter
    await AccountIndividual.updateOne(
      { user_id: followerId },
      {
        $inc: { followingCount: -1 },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Unfollowed successfully",
    });
  } catch (error: any) {
    console.error("Error in unfollow endpoint:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
