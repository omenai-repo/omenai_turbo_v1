import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { redis } from "@omenai/upstash-config";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
const GetAccountIdSchema = z.object({
  gallery_id: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { gallery_id } = await validateRequestBody(
      request,
      GetAccountIdSchema,
    );

    const cacheKey = `accountId:${gallery_id}`;

    await connectMongoDB();

    try {
      const accountIdInfo = await redis.get(cacheKey);

      const parsedAccountInfo =
        typeof accountIdInfo === "string"
          ? JSON.parse(accountIdInfo)
          : accountIdInfo;

      if (
        !parsedAccountInfo ||
        parsedAccountInfo.connected_account_id === null
      ) {
        const account = await fetchAndSetRedisCache(gallery_id, cacheKey);
        return NextResponse.json({
          message: "Successfully fetched account info",
          data: account,
        });
      }

      return NextResponse.json({
        message: "Successfully fetched account info",
        data: parsedAccountInfo,
      });
    } catch (error) {
      const account = await fetchAndSetRedisCache(gallery_id, cacheKey);
      return NextResponse.json({
        message: "Successfully fetched account info",
        data: account,
      });
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "stripe: get account id",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});

async function fetchAndSetRedisCache(gallery_id: string, cacheKey: string) {
  const account = await AccountGallery.findOne(
    { gallery_id },
    "connected_account_id gallery_verified",
  ).lean();

  if (!account) {
    throw new NotFoundError(
      "An account with the given ID was not found. Please try again or contact support",
    );
  }

  try {
    await redis.set(cacheKey, JSON.stringify(account), { ex: 21600 });
  } catch (redisWriteErr) {
    console.error(`Redis Write Error [${cacheKey}]:`, redisWriteErr);
    createErrorRollbarReport(
      "stripe: check stripe details submitted : redis write error",
      redisWriteErr as any,
      500,
    );
  }

  return account;
}
