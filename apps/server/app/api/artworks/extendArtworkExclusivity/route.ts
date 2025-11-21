import { addDaysToDate } from "@omenai/shared-utils/src/addDaysToDate";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const { art_id } = await request.json();

    if (!art_id) throw new BadRequestError("art_id is required");

    await connectMongoDB();

    const artwork = (await Artworkuploads.findOne(
      { art_id },
      "exclusivity_status art_id"
    ).lean()) as {
      exclusivity_status?: {
        exclusivity_end_date?: Date;
        exclusivity_date?: Date;
      };
      art_id: string;
    } | null;

    if (!artwork) throw new BadRequestError("Artwork not found");

    const future_exclusivity_date = addDaysToDate(90);

    const updateArtworkExclusivity = await Artworkuploads.updateOne(
      { art_id },
      {
        $set: {
          "exclusivity_status.exclusivity_type": "exclusive",
          "exclusivity_status.exclusivity_end_date": future_exclusivity_date,
        },
      }
    );

    await CreateOrder.updateMany(
      {
        "artwork_data.art_id": artwork.art_id,
      },
      {
        $set: {
          "artwork_data.exclusivity_status.exclusivity_type": "exclusive",
          "artwork_data.exclusivity_status.exclusivity_end_date":
            future_exclusivity_date,
        },
      }
    );

    if (updateArtworkExclusivity.modifiedCount === 0) {
      throw new ServerError(
        "Something went wrong. Please try again later or contact support"
      );
    }

    return NextResponse.json(
      { message: "Exclusivity period extended for 90 days" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: extend artwork Exclusivity",
      error,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status ?? 500 }
    );
  }
});
