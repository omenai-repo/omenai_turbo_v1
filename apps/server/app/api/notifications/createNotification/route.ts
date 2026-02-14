import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { NotificationDataType } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import z from "zod";
import { createErrorRollbarReport } from "../../util";

const NotificationDataSchema = z.object({
  type: z.enum(["wallet", "orders", "subscriptions", "updates"]),
  access_type: z.enum(["collector", "gallery", "artist"]),
  metadata: z.record(z.string(), z.any()),
  userId: z.string(),
});
const notificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: NotificationDataSchema,
});
export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    const validated = notificationSchema.parse(await request.json());

    // validated is now typed and safe to use
    const { title, body, data } = validated;

    const date = toUTCDate(new Date());

    const notificationHistoryData = {
      title,
      body,
      data,
      sent: true,
      sentAt: date,
    };

    await connectMongoDB();
    const createNotificationHistory = await NotificationHistory.create(
      notificationHistoryData,
    );

    if (!createNotificationHistory)
      throw new ServerError(
        "Unable to save notification data, please contact support",
      );

    return NextResponse.json(
      { message: "Notification record created" },
      { status: 201 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "notifications: create notification",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
