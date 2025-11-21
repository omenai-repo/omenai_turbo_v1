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
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { createErrorRollbarReport } from "../../../util";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { gallery_id, address } = await request.json();
    if (!gallery_id || !address)
      throw new BadRequestError("Invalid input parameters");

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
          Origin: "https://omenai.app",
        },
      }
    );
    const result = await response.json();

    if (!response.ok) throw new BadRequestError(result.message);

    const updatedData = await AccountGallery.updateOne(
      { gallery_id },
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
      "updates: gaallery address",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
