import { NextResponse } from "next/server";
import { sendArtistFundsWithdrawalProcessingMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail";
import { sendArtistFundsWithdrawalSuccessMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail";
import { sendArtistFundsWithdrawalFailed } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed";
export async function GET() {
  const email = "moses@omenai.net";
  sendArtistFundsWithdrawalProcessingMail({
    amount: "$ 5,000",
    email: email,
    name: "Test user",
  });
  sendArtistFundsWithdrawalSuccessMail({
    amount: "$ 5,000",
    email: email,
    name: "Test user",
  });
  sendArtistFundsWithdrawalFailed({
    amount: "$ 5,000",
    email: email,
    name: "Test user",
  });
  return NextResponse.json({
    message: "Successful",
  });
}
