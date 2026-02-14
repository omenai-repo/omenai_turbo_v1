import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { getApiUrl } from "@omenai/url-config/src/config";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
const Schema = z.object({
  artist_id: z.string(),
  base_currency: z.string(),
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

    const { artist_id, address, base_currency } = await validateRequestBody(
      request,
      Schema,
    );

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

    const updatedData = await AccountArtist.updateOne(
      { artist_id },
      { $set: { address, base_currency } },
    );

    await Wallet.updateOne(
      { owner_id: artist_id },
      { $set: { base_currency } },
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
      "updates: artist address",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
