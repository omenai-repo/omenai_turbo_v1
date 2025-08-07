import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendOrderDeclinedMail } from "@omenai/shared-emails/src/models/orders/orderDeclinedMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig, NotificationPayload } from "@omenai/shared-types";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { data, order_id } = await request.json();

    const declineOrder = await CreateOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          order_accepted: { status: data.status, reason: data.reason },
          status: "completed",
        },
      },
      { new: true }
    );

    if (!declineOrder) throw new ServerError("An error occured");

    const buyer_push_token = await DeviceManagement.findOne(
      { auth_id: declineOrder.buyer_details.id },
      "device_push_token"
    );

    if (buyer_push_token?.device_push_token) {
      const buyer_notif_payload: NotificationPayload = {
        to: buyer_push_token.device_push_token,
        title: "Order request declined",
        body: "Your order request has been declined",
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {
            orderId: declineOrder.order_id,
            date: toUTCDate(new Date()),
          },
          userId: declineOrder.buyer_details.id,
        },
      };

      await createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notification_workflow_buyer_${declineOrder.order_id}_${generateDigit(2)}`,
        JSON.stringify(buyer_notif_payload)
      ).catch((error) => {
        console.error("Failed to send buyer notification:", error);
      });
    }

    await sendOrderDeclinedMail({
      name: declineOrder.buyer_details.name,
      email: declineOrder.buyer_details.email,
      reason: declineOrder.order_accepted.reason,
      artwork_data: declineOrder.artwork_data,
    });

    return NextResponse.json(
      {
        message: "Successfully declined order",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
