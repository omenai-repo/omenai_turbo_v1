import { NextResponse } from "next/server";
export async function GET() {
  console.log(
    "DHL_API_KEY loaded:",
    !!process.env.DHL_API_KEY,
    "key",
    process.env.DHL_API_KEY
  );
  console.log(
    "DHL_API_SECRET loaded:",
    !!process.env.DHL_API_SECRET,
    "secret",
    process.env.DHL_API_SECRET
  );
  return NextResponse.json({
    message: "Successful",
  });
}
