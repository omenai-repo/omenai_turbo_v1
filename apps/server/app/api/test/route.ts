import { NextResponse } from "next/server";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { sendOrderRequestReminder } from "@omenai/shared-emails/src/models/orders/orderRequestReminder";
import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
import { sendRoleChangeMail } from "@omenai/shared-emails/src/models/admin/sendRoleChangeMail";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { ServerError } from "../../../custom/errors/dictionary/errorDictionary";
import {
  NotificationData,
  NotificationDataType,
  NotificationPayload,
} from "@omenai/shared-types";
export const POST = withAppRouterHighlight(async function POST() {
  // const data = await sendRoleChangeMail({
  //   name: "Moses Chukwunekwu",
  //   previousRole: "Editor",
  //   newRole: "Admin",
  //   email: "dantereus1@gmail.com",
  // });, {

  // const res = await fetch("https://exp.host/--/api/v2/push/send", {
  //   method: "POST",
  //   headers: {},
  //   body: JSON.stringify({
  //     to: "ExponentPushToken[uWP6MPMoP2iBBY1DuIQB3P]",
  //     title: "New Order",
  //     body: "You have a new order from John!",
  //     sound: "default",
  //     priority: "high",
  //     data: {
  //       type: "order",
  //       orderId: "abc123",
  //       userId: "john42",
  //     },
  //   }),
  // });

  const payload: NotificationPayload = {
    to: "ExponentPushToken[uWP6MPMoP2iBBY1DuIQB3P]",
    title: "New order request",
    body: "You have a new order requst!",
    data: {
      type: "orders",
      access_type: "artist",
      metadata: {
        orderId: "53053us5850",
      },
      userId: "6112636c-ec83-48f2-a7a8-d9f1c9e44b4c",
    },
  };

  const workflowID = await createWorkflow(
    "/api/workflows/notification/pushNotification",
    `notification_workflow${generateDigit(2)}`,
    JSON.stringify(payload)
  );

  if (!workflowID) throw new ServerError("Workflow failed");

  return NextResponse.json(
    { message: "Notification Workflow started", workflowID },
    { status: 200 }
  );

  // console.log(data);
});

// {
//     name: "Moses Chuks",
//     email: "dantereus1@gmail.com",
//     order_id: "18085108510",
//     user_id: "vnsjvlnt434",
//     artwork_data: {
//       title: "Hello",
//       art_id: "nvs vskv80sv8sfvs",
//       artist: "Dan Fruscheer",
//       pricing: { usd_price: "$5835" },
//       url: "nslvskjdsv",
//     },
//   }
