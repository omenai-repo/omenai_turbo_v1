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
  return NextResponse.json({
    message: "Successful",
  });
}
