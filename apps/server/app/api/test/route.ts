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
import { sendArtistWaitlistInviteEmail } from "@omenai/shared-emails/src/models/admin/sendArtistWaitlistInviteEmail";
import { sendCollectorWaitlistInvite } from "@omenai/shared-emails/src/models/admin/sendCollectorWaitlistInvite";
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
  await sendArtistWaitlistInviteEmail({
    name: "Theon Greyjoy",
    email: "moses@omenai.net",
  });
  await sendCollectorWaitlistInvite({
    name: "Lord Bolton",
    email: "moses@omenai.net",
  });

  // const data = await getFutureShipmentDate(3, true, "US");
  return NextResponse.json({ message: "Test route is working!" });
}
