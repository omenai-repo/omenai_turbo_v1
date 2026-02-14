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
  galleryId: z.string(),
});
export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const galleryIdParams = searchParams.get("id");
  try {
    const { galleryId } = validateGetRouteParams(FetchIcomeSchema, {
      galleryId: galleryIdParams,
    });
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
      "gallery: fetch income data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message || "Unexpected error" },
      { status: error_response?.status || 500 },
    );
  }
});
