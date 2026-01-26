import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { mockInvoice } from "./test_workflow/p";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
import { SendArtistShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendArtistShipmentSuccessEmail";
import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";

export async function GET() {
  await sendBuyerShipmentEmail({
    artistName: "Frank Raymond",
    artwork: "Glacial Landscape",
    email: "rodolphe@omenai.app",
    name: "Ra's Al Ghul",
    artworkPrice: "$12345",
    trackingCode: "1234",
    artworkImage:
      "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/696a43780031549618dc/preview?width=1200&height=0&gravity=center&quality=90&output=webp&project=682272b1001e9d1609a8",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
