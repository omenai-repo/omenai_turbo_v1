import { NextResponse } from "next/server";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { sendOrderRequestReminder } from "@omenai/shared-emails/src/models/orders/orderRequestReminder";
import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
import { sendRoleChangeMail } from "@omenai/shared-emails/src/models/admin/sendRoleChangeMail";
export const GET = withAppRouterHighlight(async function GET() {
  // const data = await sendRoleChangeMail({
  //   name: "Moses Chukwunekwu",
  //   previousRole: "Editor",
  //   newRole: "Admin",
  //   email: "dantereus1@gmail.com",
  // });, {

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {},
    body: JSON.stringify({
      to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      title: "New Order",
      body: "You have a new order from John!",
      sound: "default",
      priority: "high",
      data: {
        type: "order",
        orderId: "abc123",
        userId: "john42",
      },
    }),
  });

  // console.log(data);

  return NextResponse.json({ message: "Successful", data });
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
