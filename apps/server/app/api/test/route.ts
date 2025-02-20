import { NextResponse } from "next/server";
import { sendTestMail } from "@omenai/shared-emails/src/models/test/sendTestMail";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
export async function POST(request: Request) {
  // const email_api_key = sendTestMail({
  //   name: "Moses Chukwunekwu",
  //   email: "dantereus1@gmail.com",
  // });
  const data = await request.json();
  const rating = calculateArtistRating(data);
  if (rating.status === "error") {
    return NextResponse.json(
      {
        message: "Artist categorization algorithm ran",
        data: rating,
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      message: "Artist categorization algorithm ran",
      data: rating,
    },
    { status: 200 }
  );
}
