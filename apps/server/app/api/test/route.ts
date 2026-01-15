import { NextResponse } from "next/server";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";

export async function GET() {
  await sendShipmentScheduledEmail({
    artwork: "She's a real Gem",
    artworkId: "acc7f9e2-df5c-45a2-b5c4-6b6654ca11ec",
    artistname: "Benjamin Niyomugabo",
    price: "$ 23 456.77",
    email: "rodolphe@omenai.net",
    name: "Moses",
    artworkImage:
      "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/6911be24002b1a8dab46/preview?width=800&height=0&gravity=center&quality=40&output=webp&project=682272b1001e9d1609a8",
  });

  return NextResponse.json({
    success: true,
  });
}
