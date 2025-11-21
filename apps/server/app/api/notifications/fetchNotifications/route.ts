import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  BadRequestError,
  ForbiddenError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { createErrorRollbarReport } from "../../util";

export const GET = withRateLimit(lenientRateLimit)(async function GET(
  request: Request
) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");
  const access_type = searchParams.get("access_type");
  try {
    if (!id || !access_type)
      throw new BadRequestError("Invalid request parameters");
    const userAgent: string | null = request.headers.get("User-Agent") || null;
    const authorization: string | null =
      request.headers.get("Authorization") || null;

    if (
      !userAgent ||
      userAgent !== process.env.MOBILE_USER_AGENT ||
      !authorization ||
      authorization !== process.env.APP_AUTHORIZATION_SECRET
    )
      throw new ForbiddenError("Access to resource is forbidden");

    await connectMongoDB();

    const notificationHistories = await NotificationHistory.find({
      "data.access_type": access_type,
      "data.userId": id,
    });

    return NextResponse.json(
      { message: "Notification history fetched", data: notificationHistories },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    createErrorRollbarReport(
      "notifications: fetch notification",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
