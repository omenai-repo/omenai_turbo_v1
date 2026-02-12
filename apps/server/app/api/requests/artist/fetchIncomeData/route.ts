import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";
const FetchIcomeSchema = z.object({
  artistId: z.string(),
});
export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const id = searchParams.get("id");
  try {
    await connectMongoDB();
    const { artistId } = validateGetRouteParams(FetchIcomeSchema, {
      artistId: id,
    });
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
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Income data fetched successfully", data: result[0] },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: fetch income data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
