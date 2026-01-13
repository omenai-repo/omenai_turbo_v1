import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { Invoice } from "@omenai/shared-models/models/invoice/InvoiceSchema";
import { InvoiceTypes } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request
) {
  await connectMongoDB();
  const url = request.url;
  const invoiceNumber = new URL(url).searchParams.get("id");
  try {
    if (!invoiceNumber || typeof invoiceNumber !== "string")
      throw new BadRequestError(
        "Invalid parameter provider. Please try again or contact support"
      );

    const invoice = (await Invoice.findOne({
      invoiceNumber,
    }).lean()) as unknown as InvoiceTypes;
    return NextResponse.json(
      { message: "Invoice data retrieved", invoice },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("locks: check Lock", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
