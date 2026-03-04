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
import { email } from "zod";
import { render } from "@react-email/render";
import SendArtistWaitListInvites from "@omenai/shared-emails/src/views/admin/SendArtistWaitListInvites";
import SendCollectorWaitlistInvite from "@omenai/shared-emails/src/views/admin/SendCollectorWaitlistInvite";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
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
const matchedUsers = [
  {
    entity: "artist",
    email: "rodolphe@omenai.net",
    name: "Theon Greyjoy",
  },
  {
    entity: "user",
    email: "rodolphe@omenai.net",
    name: "Lord Bolton",
  },
  {
    entity: "artist",
    email: "moses@omenai.net",
    name: "Theon Greyjoy",
  },
  {
    entity: "user",
    email: "moses@omenai.net",
    name: "Lord Bolton",
  },
  {
    entity: "artist",
    email: "kelvin@omenai.net",
    name: "Theon Greyjoy",
  },
  {
    entity: "user",
    email: "kelvin@omenai.net",
    name: "Lord Bolton",
  },
];
export async function GET() {
  const inviteUserEmailPayload = await Promise.all(
    matchedUsers.map(async (user) => {
      if (user.entity === "artist") {
        const html = await render(SendArtistWaitListInvites(user.name));
        return {
          from: "Omenai Onboarding <onboarding@omenai.app>",
          to: [user.email],
          subject: "OMENAI is Live — Activate Your Profile",
          html,
        };
      } else {
        const html = await render(SendCollectorWaitlistInvite(user.name));
        return {
          from: "Omenai Onboarding <onboarding@omenai.app>",
          to: [user.email],
          subject: "OMENAI is Now Live",
          html,
        };
      }
    }),
  );
  await resend.batch.send(inviteUserEmailPayload);

  // const data = await getFutureShipmentDate(3, true, "US");
  return NextResponse.json({ message: "Test route is working!" });
}
