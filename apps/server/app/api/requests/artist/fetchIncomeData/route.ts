import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../../../util";

export const GET = withAppRouterHighlight(async function GET(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const artistId = searchParams.get("id");
  try {
    await connectMongoDB();

    const pipeline = [
      {
        $match: {
          trans_recipient_id: artistId,
          trans_recipient_role: "artist",
        },
      },
      {
        $group: {
          _id: null,
          salesRevenue: { $sum: { $ifNull: ["$trans_pricing.unit_price", 0] } },
          netIncome: {
            $sum: {
              $add: [
                { $ifNull: ["$trans_pricing.amount_total", 0] },
                {
                  $multiply: [
                    { $ifNull: ["$trans_pricing.commission", 0] },
                    -1,
                  ],
                },
                {
                  $multiply: [
                    { $ifNull: ["$trans_pricing.penalty_fee", 0] },
                    -1,
                  ],
                },
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
      "artist: fetch income data",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
