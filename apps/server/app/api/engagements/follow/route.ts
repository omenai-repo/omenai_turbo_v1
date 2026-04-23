import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextRequest, NextResponse } from "next/server";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import z from "zod";
import { validateRequestBody } from "../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["user"],
};

const FollowerSchema = z.object({
  followerId: z.string(),
  followingId: z.string(),
  followingType: z.enum(["artist", "gallery"]),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
) {
  try {
    const { followerId, followingId, followingType } =
      await validateRequestBody(req, FollowerSchema);

    await connectMongoDB();
    // 1. Create the follow record
    await Follow.create({
      follower: followerId,
      followingId,
      followingType,
    });

    // 2. Increment counters (Example for Gallery)
    if (followingType === "gallery") {
      await AccountGallery.updateOne(
        { gallery_id: followingId },
        {
          $inc: { followerCount: 1 },
        },
      );
    }
    if (followingType === "artist") {
      await AccountArtist.updateOne(
        { artist_id: followingId },
        {
          $inc: { followerCount: 1 },
        },
      );
    }

    // 3. Increment the user's following count
    await AccountIndividual.updateOne(
      { user_id: followerId },
      {
        $inc: { followingCount: 1 },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Followed successfully",
    });
  } catch (error: any) {
    console.log(error);
    // Catch duplicate key error (11000) if they are already following
    if (error.code === 11000) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
