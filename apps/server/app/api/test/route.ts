import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistBlockedMail } from "@omenai/shared-emails/src/models/artist/sendArtistBlockedMail";
import { render } from "@react-email/render";
import { Resend } from "resend";
import SubscriptionPaymentFailedMail from "@omenai/shared-emails/src/views/subscription/SubscriptionPaymentFailedMail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  // const promise = await sendArtistBlockedMail({
  //   name: "Test User",
  //   email: "rodolphe@omenai.net",
  // });

  const expiredEmailPayload = await Promise.all(
    Array.from({ length: 2 }).map(async (subscription) => {
      const html = await render(SubscriptionPaymentFailedMail("Test User"));
      return {
        from: "Subscription <omenai@omenai.app>",
        to: ["rodolphe@omenai.net"],
        subject: "Action Required: We were Unable to Process Your Payment",
        html,
      };
    })
  );
  await resend.batch.send(expiredEmailPayload);

  return NextResponse.json({
    message: "Successful",
  });
}
