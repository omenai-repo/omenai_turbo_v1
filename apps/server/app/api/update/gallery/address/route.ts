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
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const Schema = z.object({
  gallery_id: z.string(),
  address: z.object({
    address_line: z.string(),
    city: z.string(),
    country: z.string(),
    countryCode: z.string(),
    state: z.string(),
    stateCode: z.string(),
    zip: z.string(),
  }),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { gallery_id, address } = await validateRequestBody(request, Schema);
    const payload = {
      type: "pickup",
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
        },
        credentials: "include",
      },
    );
    const result = await response.json();

    if (!response.ok) throw new BadRequestError(result.message);

    const updatedData = await AccountGallery.updateOne(
      { gallery_id },
      { $set: { address } },
    );

    if (!updatedData) throw new ServerError("An unexpected error has occured.");

    return NextResponse.json(
      {
        message: "Address information updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "updates: gaallery address",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
