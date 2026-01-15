import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { mockInvoice } from "./test_workflow/p";
import { SendWaitlistRegistrationEmail } from "@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail";

export async function GET() {
  await SendWaitlistRegistrationEmail({ email: "moses@omenai.net" });

  return NextResponse.json({
    message: "Successful",
  });
}
