import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { ArtworkSchemaTypes, CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
import { trackPlatformEvent } from "@omenai/shared-lib/analytics/trackPlatformEvents";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
// NEW: Import your PriceRequest model (Adjust path as necessary)
import { PriceRequest } from "@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema";
import { ArtworkMedium } from "@omenai/shared-lib/algorithms/priceGenerator";
import {
  BadRequestError,
  ForbiddenError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["user"],
};

const RequestPriceSchema = z.object({
  art_id: z.string(),
  user_id: z.string(),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
  _,
  sessionData,
) {
  try {
    if (!sessionData) throw new ForbiddenError("Access Denied");
    const { art_id, user_id } = await validateRequestBody(
      request,
      RequestPriceSchema,
    );
    await connectMongoDB();

    const [account, artwork] = await Promise.all([
      AccountIndividual.findOne(
        { user_id },
        "name email user_id",
      ).lean() as unknown as { name: string; email: string; user_id: string },

      // FIXED: Added 'author_id' to the projection so we know who the seller is
      Artworkuploads.findOne(
        { art_id },
        "title artist art_id url medium pricing author_id",
      ).lean() as unknown as {
        title: string;
        artist: string;
        art_id: string;
        url: string;
        author_id: string;
        medium: ArtworkMedium;
        pricing: ArtworkSchemaTypes["pricing"];
      },
    ]);

    if (!account || !artwork)
      throw new ServerError(
        "Something went wrong, please try again or contact support",
      );

    // --- NEW: Uniqueness Gate ---
    // Check if this specific user has already requested this specific artwork
    const existingRequest = await PriceRequest.findOne({
      buyer_id: user_id,
      art_id: art_id,
    }).lean();

    if (existingRequest) {
      throw new BadRequestError(
        "You have already requested the price for this artwork.",
      );
    }
    // ----------------------------

    const { name, email, user_id: userId } = account;
    const { art_id: artId } = artwork;
    const session_id = sessionData.csrfToken;

    // --- NEW: Create the Price Request Document ---
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day TTL

    await PriceRequest.create({
      art_id: artwork.art_id,
      buyer_id: userId,
      seller_id: artwork.author_id, // Pulled from the updated projection
      artwork_snapshot: {
        title: artwork.title,
        artist: artwork.artist,
        url: artwork.url,
      },
      expires_at: expiresAt, // Activates MongoDB TTL deletion
    });
    // ----------------------------------------------

    // Fire off the email and analytics in parallel so we don't block the response
    await Promise.all([
      sendPriceEmail({
        name,
        email,
        artwork_data: artwork,
      }),
      trackPlatformEvent({
        req: request,
        event_type: "por_inquiry",
        session_id,
        user_id: userId,
        art_id: artId,
        metadata: {
          has_custom_message: true,
          message: `Artwork price requested for ${artwork.title}`,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Successful",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "pricing: request price",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
