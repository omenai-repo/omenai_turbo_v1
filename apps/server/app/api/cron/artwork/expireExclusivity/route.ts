import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  try {
    await connectMongoDB();

    const currentDate = toUTCDate(new Date());

    // Fetch expired exclusive contracts
    const expiredContracts = await Artworkuploads.find(
      {
        "exclusivity_status.exclusivity_type": "exclusive",
        "exclusivity_status.exclusivity_end_date": { $lt: currentDate },
      },
      "art_id"
    ).lean();

    if (expiredContracts.length === 0) {
      console.log("No artwork exclusivity contracts expired");
      return NextResponse.json(
        { message: "No expired contracts found" },
        { status: 200 }
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
              "exclusivity_status.exclusivity_end_date": null,
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
              "artwork_data.exclusivity_status.exclusivity_end_date": null,
            },
          },
        },
      });
    }

    const [artworkResult, orderResult] = await Promise.all([
      Artworkuploads.bulkWrite(updateArtworkOps),
      CreateOrder.bulkWrite(updateOrderOps),
    ]);

    console.log(
      `✅ Updated ${artworkResult.modifiedCount} artworks, ${orderResult.modifiedCount} orders`
    );

    return NextResponse.json(
      {
        message: "Exclusivity contracts updated successfully",
        artworksUpdated: artworkResult.modifiedCount,
        ordersUpdated: orderResult.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    const err = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: err?.message },
      { status: err?.status }
    );
  }
});
