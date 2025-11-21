import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../../../util";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const galleryId = searchParams.get("id");

  if (!galleryId) {
    return NextResponse.json(
      { message: "Missing gallery id" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

    const pipeline = [
      {
        $match: {
          trans_recipient_id: galleryId,
          trans_recipient_role: "gallery",
        },
      },
      {
        $group: {
          _id: null,
          salesRevenue: {
            $sum: {
              $toDouble: { $ifNull: ["$trans_pricing.unit_price", 0] },
            },
          },
          netIncome: {
            $sum: {
              $subtract: [
                { $toDouble: { $ifNull: ["$trans_pricing.unit_price", 0] } },
                { $toDouble: { $ifNull: ["$trans_pricing.commission", 0] } },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          salesRevenue: 1,
          netIncome: 1,
        },
      },
    ];

    const result = await PurchaseTransactions.aggregate(pipeline);

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Income data fetched successfully",
          data: { netIncome: 0, salesRevenue: 0 },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Income data fetched successfully", data: result[0] },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "gallery: fetch income data",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message || "Unexpected error" },
      { status: error_response?.status || 500 }
    );
  }
});
