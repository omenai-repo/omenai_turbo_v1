import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { ArtistCategory, ArtworkMediumTypes } from "@omenai/shared-types";
import {
  calculateArtworkPrice,
  ArtworkPricing,
} from "@omenai/shared-lib/algorithms/priceGenerator";
import {
  BadRequestError,
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { redis } from "@omenai/upstash-config";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const GetArtworkPriceForArtist = z.object({
  medium: z.enum([
    "Photography",
    "Works on paper",
    "Acrylic on canvas/linen/panel",
    "Mixed media on paper/canvas",
    "Oil on canvas/panel",
  ]),
  height: z.string(),
  width: z.string(),
  category: z.enum([
    "Emerging",
    "Early Mid-Career",
    "Mid-Career",
    "Late Mid-Career",
    "Established",
    "Elite",
  ]),
  currency: z.string(),
});

export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const mediumParams: ArtworkMediumTypes = searchParams.get(
      "medium",
    ) as ArtworkMediumTypes;

    const heightParams = searchParams.get("height") as string;
    const widthParams = searchParams.get("width") as string;
    const categoryParams = searchParams.get("category");
    const currencyParams = searchParams.get("currency") as string;

    try {
      const { category, currency, height, medium, width } =
        validateGetRouteParams(GetArtworkPriceForArtist, {
          category: categoryParams,
          currency: currencyParams,
          height: heightParams,
          width: widthParams,
          medium: mediumParams,
        });
      const isArtworkPriceEnabled = (await fetchConfigCatValue(
        "artwork_price_calculation_enabled",
        "high",
      )) as boolean;

      if (!isArtworkPriceEnabled)
        throw new ForbiddenError(
          "Artwork price calculation is currently disabled",
        );

      if (Number.isNaN(+height) || Number.isNaN(+width))
        throw new BadRequestError("Height or width must be a number");

      const price: ArtworkPricing = calculateArtworkPrice({
        artistCategory: category as ArtistCategory,
        medium,
        height: +height,
        width: +width,
      });

      let rateValue: number;
      const cacheKey = `USDto${currency.toUpperCase()}`;
      const TTL_SECONDS = 86400;

      try {
        const cachedRate = await redis.get(cacheKey);

        if (cachedRate) {
          // Parse the JSON string back into a number
          rateValue = JSON.parse(cachedRate as string);
        } else {
          // Cache Miss: Proceed to fetch from external source

          const request = await fetch(
            `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY!}/pair/USD/${currency.toUpperCase()}`,
            { method: "GET" },
          );

          if (!request.ok) {
            throw new ServerError(
              "Failed to fetch exchange rate. Try again or contact support",
            );
          }

          const result = await request.json();
          rateValue = result.conversion_rate;

          try {
            await redis.set(cacheKey, JSON.stringify(rateValue), {
              ex: TTL_SECONDS,
            });
          } catch (redisError) {
            console.error(
              `Failed to WRITE to Redis for key ${cacheKey}:`,
              redisError,
            );
            createErrorRollbarReport(
              "artwork: get Artwork price for artist- Failed to WRITE to Redis for key",
              redisError,
              500,
            );
          }
        }
      } catch (redisError) {
        console.error(
          `Failed to READ from Redis for key ${cacheKey}:`,
          redisError,
        );

        // Fallback: Manually run the fetch logic here if the read failed.
        const request = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY!}/pair/USD/${currency.toUpperCase()}`,
          { method: "GET" },
        );

        if (!request.ok) {
          // If external API fails after cache failed, then throw a ServerError.
          throw new ServerError(
            "Failed to fetch exchange rate after cache failure.",
          );
        }

        const result = await request.json();
        rateValue = result.conversion_rate;
      }

      const price_response_data = {
        price: rateValue * price.recommendedPrice,
        usd_price: price.recommendedPrice,
        price_data: price,
        shouldShowPrice: "Yes",
        currency,
      };

      return NextResponse.json(
        { message: "Proposed Price calculated", data: price_response_data },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artwork: get Artwork price for artist",
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
