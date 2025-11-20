import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";
import { z } from "zod";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport } from "../../util";

const patchSchema = z
  .object({
    read: z.boolean(),
    readAt: z.date().or(z.string().transform((str) => new Date(str))),
    userId: z.string(),
    access_type: z.enum(["collector", "gallery", "artist"]),
    notification_id: z.string(),
  })
  .strict();

export const PATCH = withRateLimit(standardRateLimit)(async function PATCH(
  request: Request
) {
  const data = await request.json();
  try {
    const validated = patchSchema.parse(data);

    const { userId, access_type, notification_id, ...updates } = validated;

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

    const updateNotificationHistory = await NotificationHistory.updateOne(
      {
        "data.userId": userId,
        "data.access_type": access_type,
        id: notification_id,
      },
      { $set: updates }
    );

    if (updateNotificationHistory.matchedCount === 0)
      throw new NotFoundError(
        "Notification not found or does not match filters"
      );
    return NextResponse.json(
      {
        message: "Notification updated successfully",
        updated: updateNotificationHistory.modifiedCount > 0,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    createErrorRollbarReport(
      "notifications: update notification",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
