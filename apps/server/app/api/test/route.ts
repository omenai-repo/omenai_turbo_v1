import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { NextResponse } from "next/server";
import { sendArtistShippmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistShippmentSuccessfulMail";
import { sendGalleryShipmentSuccessfulMail } from "../../../../../shared/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistFundUnlockEmail } from "../../../../../shared/shared-emails/src/models/artist/sendArtistFundUnlockEmail";
export async function GET() {
  const promise = await sendArtistFundUnlockEmail({
    name: "Test User",
    email: "rodolphe@omenai.net",
    amount: 2000,
  });

  return NextResponse.json({
    message: "Successful",
  });
}
