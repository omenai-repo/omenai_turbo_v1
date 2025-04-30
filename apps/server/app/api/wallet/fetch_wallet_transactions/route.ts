import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

export async function GET(request: NextRequest) {
  await connectMongoDB();
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet_id = searchParams.get("id");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit");
    const status = searchParams.get("status")?.toLowerCase(); // make it case-insensitive
    const page = searchParams.get("page") || 1;
    const skip = (Number(page) - 1) * 10;

    if (!year || !wallet_id)
      throw new BadRequestError("Missing url params - year and id is required");

    const numericYear = Number(year);
    const numericLimit = limit ? Number(limit) : 0;

    if (isNaN(numericYear) || (limit && isNaN(numericLimit)))
      throw new BadRequestError(
        "Invalid param type. 'year' and 'limit' should be numerical."
      );

    // Build the query
    const query: any = {
      wallet_id,
      "trans_date.year": numericYear,
    };

    const validStatuses = ["pending", "failed", "successful"];

    if (status && status !== "all") {
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(
          "Invalid 'status' param. Accepted values: pending, failed, successful, all"
        );
      }
      query.trans_status = status.toUpperCase(); // Assuming status in DB is in uppercase
    }

    let mongoQuery = WalletTransaction.find(query)
      .skip(skip)
      .sort({ createdAt: -1 });

    if (numericLimit && numericLimit > 0) {
      mongoQuery = mongoQuery.limit(numericLimit);
    }

    const fetch_wallet_transactions = await mongoQuery.exec();

    const total = await WalletTransaction.countDocuments({ wallet_id });

    return NextResponse.json(
      {
        message: "Wallet transactions retrieved successfully",
        data: fetch_wallet_transactions,
        pageCount: Math.ceil(total / 10),
      },
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
