import { NextResponse } from "next/server";
import { testRollbar } from "@omenai/shared-services/test/test";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
export async function GET() {
  // await sendShipmentScheduledEmail({
  //   email: "moses@omenai.net",
  //   name: "Test User",
  //   trackingCode: "1234567",
  //   artwork: "Botched Lillies",
  //   artistName: "Test Artist",
  //   artworkImage:
  //     "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/69244c070038a3e7c2d7/preview?width=800&height=0&gravity=center&quality=40&output=webp&project=682272b1001e9d1609a8",
  //   artworkPrice: 12345,
  // });
  await SendWaitlistRegistrationEmail({ email: "moses@omenai.net" });
  return NextResponse.json({
    message: "Successful",
  });
}
