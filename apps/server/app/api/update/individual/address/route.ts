import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

import { CombinedConfig } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import { createErrorRollbarReport } from "../../../util";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { user_id, address } = await request.json();
    if (!user_id || !address)
      throw new BadRequestError("Invalid input parameters");

    const payload = {
      type: "delivery",
      countryCode: address.countryCode,
      postalCode: address.zip,
      cityName: address.state,
      countyName: address.city,
    };
    const response = await fetch(
      `${getApiUrl()}/api/shipment/address_validation`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Origin: "https://omenai.app",
        },
      }
    );
    const result = await response.json();

    if (!response.ok) throw new BadRequestError(result.message);

    const updatedData = await AccountIndividual.updateOne(
      { user_id },
      { $set: { address } }
    );

    if (!updatedData) throw new ServerError("An unexpected error has occured.");

    return NextResponse.json(
      {
        message: "Address information updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "updates: Collector address",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
