import { NextResponse } from "next/server";
import { sendOrderRequestReminder } from "@omenai/shared-emails/src/models/orders/sendOrderRequestReminder";
import { sendOrderRequestReceivedMail } from "@omenai/shared-emails/src/models/orders/orderRequestReceived";
import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendPriceEmail } from "@omenai/shared-emails/src/models/orders/requestPriceEmail";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { sendPaymentPendingMail } from "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail";
import { sendPaymentSuccessGalleryMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail";
import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";
import { sendPaymentSuccessMailArtist } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMailArtist";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";
const payload = {
  email: "dantereus1@gmail.com",
  name: "Elias",
  artwork: "Symphony of the Sahara",
  artistName: "Amina Bello",
  artworkImage: "699250ec002f16dee208",
  price: "$8,500.00",
  transaction_id: "pi_3MtwBwLkdIwHu7ix28a3",
  order_date: "February 24, 2026",
  order_id: "882194-ACQ",
};
export async function GET() {
  // await sendPaymentSuccessMailArtist(payload);
  // console.log('test')
  await sendPriceEmail({
    name: "Dante Reus",
    email : "rodolphe@omenai.net",
    artwork_data: {
      art_id: "ddb13ea2-8ff8-416a-b1bb-46106d3c0169",
      artist: "Frank Raymond",
      medium: "Acrylic on canvas/linen/panel",
      pricing: {
        usd_price: 12345,
        currency: "usd",
        price: 12345,
        shouldShowPrice: "true",
      },
      title: "Symphony of the Sahara",
      url: "68b4e394002c1c773ad6",
    },
  });

  // const data = await getFutureShipmentDate(3, true, "US");
  return NextResponse.json({ message: "Test route is working!" });
}
