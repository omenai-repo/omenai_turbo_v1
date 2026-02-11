import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { mockInvoice } from "./test_workflow/p";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
import { SendArtistShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendArtistShipmentSuccessEmail";
import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { SendBuyerShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendBuyerShipmentSuccessEmail";
import { SendGalleryShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendGalleryShipmentSuccessEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";
import SendArtistShipmentSuccess from "@omenai/shared-emails/src/views/shipment/SendArtistShipmentSuccess";

export async function GET() {
  await SendArtistShipmentSuccessEmail({
    email: "rodolphe@omenai.net",
    name: "Samwell Tarly",
    trackingCode: "1223445",
    artworkImage: "69826eb2000756464742",
    artwork: "Comfort zone",
    artistName: "Nana Bruce",
    price: formatPrice("4414"),
  });

  // await sendShipmentScheduledEmail({
  //   artistname: "Frank Raymond",
  //   artwork: "Glacial Landscape",
  //   email: "moses@omenai.net",
  //   name: "Ra's Al Ghul",
  //   price: formatPrice("4414"),
  //   // trackingCode: "12345678",
  //   artworkId: "034b5209-be26-41ba-bf79-1b0672e7ade1",
  //   artworkImage:
  //     "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/696a43780031549618dc/preview?width=1200&height=0&gravity=center&quality=90&output=webp&project=682272b1001e9d1609a8",
  // });

  return NextResponse.json({
    message: "Successful",
  });
}
