import { NextResponse } from "next/server";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { sendOrderRequestReminder } from "@omenai/shared-emails/src/models/orders/orderRequestReminder";
import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
export const GET = withAppRouterHighlight(async function GET() {
  const data = await sendPriceEmail({
    name: "Moses Chuks",
    email: "dantereus1@gmail.com",
    artwork_data: {
      title: "Hello",
      art_id: "nvs vskv80sv8sfvs",
      artist: "Dan Fruscheer",
      medium: "Acrylic on canvas/linen/panel",
      pricing: {
        usd_price: 5835,
        price: 4253,
        shouldShowPrice: "Yes",
        currency: "USD",
      },
      url: "nslvskjdsv",
    },
  });

  console.log(data);

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
