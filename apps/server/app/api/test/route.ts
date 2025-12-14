import { NextResponse } from "next/server";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";
export async function GET() {
  await SendWaitlistRegistrationEmail({ email: "moses@omenai.net" });
  return NextResponse.json({
    message: "Successful",
  });
}
