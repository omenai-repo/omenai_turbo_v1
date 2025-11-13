import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistFundUnlockEmail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistFundUnlockEmail";
import { Resend } from "resend";
import { render } from "@react-email/render";
import SubscriptionExpireAlert from "@omenai/shared-emails/src/views/subscription/SubscriptionExpireAlert";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";
export async function GET() {
  // const promise = await sendArtistFundUnlockEmail({
  //   name: "Test User",
  //   email: "rodolphe@omenai.net",
  //   amount: 2000,
  // });

  // const resend = new Resend(process.env.RESEND_API_KEY);

  // const expiredSoonEmailPayload = await Promise.all(
  //   [
  //     { email: "rodolphe@omenai.app" },
  //     { email: "dantereus1@gmail.com" },
  //     { email: "moses@omenai.net" },
  //   ].map(async (subscription) => {
  //     const html = await render(
  //       SubscriptionExpireAlert("Test User", `Tomorrow`)
  //     );
  //     return {
  //       from: "Subscription <omenai@omenai.app>",
  //       to: [subscription.email],
  //       subject: `Your Subscription Expires tomorrow`,
  //       html,
  //     };
  //   })
  // );

  // await resend.batch.send(expiredSoonEmailPayload);
  await sendShipmentScheduledEmail({
    email: "rodolphe@omenai.app",
    name: "Test User",
    trackingCode: "1234567",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
