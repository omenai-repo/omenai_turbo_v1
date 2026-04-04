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
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const GetArtworkPriceForArtist = z.object({
  medium: z.enum([
    "Photography",
    "Works on paper",
    "Acrylic on canvas/linen/panel",
    "Mixed media on canvas",
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
  artist_id: z.string(),
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
    const artistId = searchParams.get("id") as string;

    try {
      const { category, currency, height, medium, width, artist_id } =
        validateGetRouteParams(GetArtworkPriceForArtist, {
          category: categoryParams,
          currency: currencyParams,
          height: heightParams,
          width: widthParams,
          medium: mediumParams,
          artist_id: artistId,
        });
      const isArtworkPriceEnabled = (await fetchConfigCatValue(
        "artwork_price_calculation_enabled",
        "high",
      )) as boolean;

      if (!isArtworkPriceEnabled)
        throw new ForbiddenError(
          "Artwork price calculation is currently disabled",
        );

      await connectMongoDB();
      // 1. Check if Height/Width are valid
      if (Number.isNaN(+height) || Number.isNaN(+width))
        throw new BadRequestError("Height or width must be a number");

      const artist = (await AccountArtist.findOne({
        artist_id,
      })
        .select("pricing_allowances")
        .lean()) as unknown as { pricing_allowances: any } | null;

      // 3. NEW: Null check if the artist doesn't exist
      if (!artist) {
        throw new BadRequestError("Artist profile not found");
      }

      const price: ArtworkPricing = calculateArtworkPrice({
        artistCategory: category as ArtistCategory,
        medium,
        height: +height,
        width: +width,
      });

      const MAX_AUTO_APPROVES = 3;
      const now = new Date();

      // 4. NEW: Optional chaining (?.) prevents crashes on legacy accounts
      const lastReset = new Date(
        artist.pricing_allowances?.last_reset_date || now,
      );
      let effectiveUsage = artist.pricing_allowances?.auto_approvals_used || 0;

      // Calculate the exact time difference in days
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysSinceLastReset =
        (now.getTime() - lastReset.getTime()) / msPerDay;

      // If 30+ days have passed, their effective usage for this check is 0
      if (daysSinceLastReset >= 30) {
        effectiveUsage = 0;
      }

      // Generate the final boolean
      const hasAutoApprovalsRemaining = effectiveUsage < MAX_AUTO_APPROVES;

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
        algorithm_recommendation: price,
        hasAutoApprovalsRemaining,
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
