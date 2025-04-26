import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

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
          salesRevenue: { $sum: "$trans_pricing.unit_price" },
          netIncome: {
            $sum: {
              $subtract: [
                "$trans_pricing.amount_total",
                "$trans_pricing.commission",
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

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
