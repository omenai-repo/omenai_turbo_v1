import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { ArtistCategory, ArtworkMediumTypes } from "@omenai/shared-types";
import {
  calculateArtworkPrice,
  ArtworkPricing,
} from "@omenai/shared-lib/algorithms/priceGenerator";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import kv from "@vercel/kv";

export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const medium: ArtworkMediumTypes = searchParams.get(
      "medium"
    ) as ArtworkMediumTypes;

    const height = searchParams.get("height") as string;
    const width = searchParams.get("width") as string;
    const category: ArtistCategory = searchParams.get(
      "category"
    ) as ArtistCategory;
    const currency = searchParams.get("currency") as string;
    try {
      if (!medium || !height || !width || !category) {
        throw new ServerError(
          "Missing required parameters (medium, height, width, category)"
        );
      }
      if (Number.isNaN(+height) || Number.isNaN(+width))
        throw new BadRequestError("Height or width must be a number");
      const price: ArtworkPricing = calculateArtworkPrice({
        artistCategory: category,
        medium,
        height: +height,
        width: +width,
      });

      let currentRate = 0;
      const rate = await kv.get(`USDto${currency.toUpperCase()}`);

      if (!rate) {
        // Get currency rate
        const request = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env
            .EXCHANGE_RATE_API_KEY!}/pair/USD/${currency.toUpperCase()}`,
          { method: "GET" }
        );
        if (!request.ok)
          throw new ServerError(
            "Failed to calculate Price. Try again or contact support"
          );
        const result = await request.json();
        currentRate = result.conversion_rate;
        await kv.set(`USDto${currency.toUpperCase()}`, currentRate);
      }

      const price_response_data = {
        price: currentRate * price.recommendedPrice,
        usd_price: price.recommendedPrice,
        price_data: price,
        shouldShowPrice: "Yes",
        currency,
      };

      return NextResponse.json(
        { message: "Proposed Price calculated", data: price_response_data },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      console.log(error);
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
