import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ForbiddenError } from "../../../../custom/errors/dictionary/errorDictionary";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";
const FetchNotificationsSchema = z.object({
  id: z.string(),
  access_type: z.string(),
});
export const GET = withRateLimit(lenientRateLimit)(async function GET(
  request: Request,
) {
  const searchParams = new URL(request.url).searchParams;
  const id_params = searchParams.get("id");
  const access_type_params = searchParams.get("access_type");
  try {
    const { access_type, id } = validateGetRouteParams(
      FetchNotificationsSchema,
      { id: id_params, access_type: access_type_params },
    );
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
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "notifications: fetch notification",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
