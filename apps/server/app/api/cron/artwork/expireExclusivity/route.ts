import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { createErrorRollbarReport } from "../../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { verifyAuthVercel } from "../../utils";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    await verifyAuthVercel(request);

    await connectMongoDB();

    const currentDate = toUTCDate(new Date());

    // Fetch expired exclusive contracts
    const expiredContracts = await Artworkuploads.find(
      {
        "exclusivity_status.exclusivity_type": "exclusive",
        "exclusivity_status.exclusivity_end_date": { $lt: currentDate },
      },
      "art_id",
    ).lean();

    if (expiredContracts.length === 0) {
      return NextResponse.json(
        { message: "No expired contracts found" },
        { status: 200 },
      );
    }

    const updateArtworkOps = [];
    const updateOrderOps = [];

    for (const { art_id } of expiredContracts) {
      updateArtworkOps.push({
        updateOne: {
          filter: { art_id },
          update: {
            $set: {
              "exclusivity_status.exclusivity_type": "non-exclusive",
            },
          },
        },
      });

      updateOrderOps.push({
        updateMany: {
          filter: {
            "artwork_data.art_id": art_id,
            seller_designation: "artist",
          },
          update: {
            $set: {
              "artwork_data.exclusivity_status.exclusivity_type":
                "non-exclusive",
            },
          },
        },
      });
    }

    const [artworkResult, orderResult] = await Promise.all([
      Artworkuploads.bulkWrite(updateArtworkOps),
      CreateOrder.bulkWrite(updateOrderOps),
    ]);

    return NextResponse.json(
      {
        message: "Exclusivity contracts updated successfully",
        artworksUpdated: artworkResult.modifiedCount,
        ordersUpdated: orderResult.modifiedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Artwork Exclusivity Expiration",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
