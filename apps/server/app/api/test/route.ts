import { NextResponse } from "next/server";

import { sendNexusTresholdEmail } from "../../../../../shared/shared-emails/src/models/admin/sendNexusTresholdEmail";

export async function GET() {
  await sendNexusTresholdEmail({
    email: "rodolphe@omenai.app",
    state: "New-York",
  });

  return NextResponse.json({
    message: "Successful",
  });
}
