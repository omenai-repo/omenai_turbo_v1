import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";
const CreateTransationSchema = z.object({
  trans_id: z.string(),
  trans_initiator_id: z.string(),
  trans_recipient_id: z.string(),
  trans_pricing: z.object({
    unit_price: z.number(),
    commission: z.number(),
    shipping_cost: z.number(),
    amount_total: z.number(),
    tax_fees: z.number(),
    currency: z.string(),
    penalty_fee: z.number().optional(),
  }),
  trans_date: z.date(),
  trans_recipient_role: z.enum(["gallery", "artist"]),
  status: z.enum(["successful", "processing", "failed"]),
  provider: z.enum(["flutterwave", "stripe"]),
  order_id: z.string(),
  invoice_reference: z.string().optional(),
  createdBy: z.enum(["webhook", "verification"]).optional(),
  verifiedAt: z.date().optional(),
  webhookReceivedAt: z.date().optional(),
  webhookConfirmed: z.boolean().optional(),
});
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const data = await validateRequestBody(request, CreateTransationSchema);

      const createTransaction = await PurchaseTransactions.create(data);

      if (!createTransaction)
        throw new ServerError("An error was encountered. Please try again");

      return NextResponse.json(
        {
          message: "Transaction created",
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "transactions: create transaction",
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
