import { NextResponse } from "next/server";
import { sendInvitationEmail } from "@omenai/shared-emails/src/models/admin/sendInvitationEmail";
export async function GET() {
  const email = "moses@omenai.net";
  await sendInvitationEmail({
    email,
    name: "Test user",
    inviteCode: "1234555",
    entity: "gallery",
  });
  return NextResponse.json({
    message: "Successful",
  });
}
