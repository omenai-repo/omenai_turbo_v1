import { NextResponse } from "next/server";
import { sendTestMail } from "@omenai/shared-emails/src/models/test/sendTestMail";

export async function POST(request: Request) {
  const email_api_key = sendTestMail({
    name: "Moses Chukwunekwu",
    email: "dantereus1@gmail.com",
  });
  return NextResponse.json(
    {
      message: "Verification was successful. Please login",
      data: email_api_key,
    },
    { status: 200 }
  );
}
