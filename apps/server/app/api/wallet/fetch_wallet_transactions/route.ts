import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";

const Schema = z.object({
  wallet_id: z.string(),
  year: z.string(),
  limit: z.string().optional(),
  status: z.string().toLowerCase().optional(),
  page: z.string().default("1").optional(),
});
export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    await connectMongoDB();
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const wallet_idParams = searchParams.get("id");
      const yearParams = searchParams.get("year");
      const limitParams = searchParams.get("limit");
      const statusParams = searchParams.get("status")?.toLowerCase(); // make it case-insensitive
      const pageParams = searchParams.get("page") || "1";
      const { limit, page, status, wallet_id, year } = validateGetRouteParams(
        Schema,
        {
          wallet_id: wallet_idParams ?? "",
          limit: limitParams ?? "",
          year: yearParams ?? "",
          page: pageParams,
          status: statusParams,
        },
      );
      const skip = (Number(page) - 1) * 10;

      const numericYear = Number(year);
      const numericLimit = limit ? Number(limit) : 0;

      if (Number.isNaN(numericYear) || (limit && Number.isNaN(numericLimit)))
        throw new BadRequestError(
          "Invalid param type. 'year' and 'limit' should be numerical.",
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
            "Invalid 'status' param. Accepted values: pending, failed, successful, all",
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
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: fetch wallet transactions",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
