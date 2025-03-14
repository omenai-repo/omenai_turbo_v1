import { NextRequest, NextResponse } from "next/server";
import { HEADERS } from "../resources";

export async function POST(request: NextRequest) {
  const API_URL =
    "https://express.api.dhl.com/mydhlapi/test/shipments/JD014600005037355401/tracking";

  const url = new URL(API_URL);
  const requestOptions = {
    method: "GET",
    headers: HEADERS,
  };

  try {
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();
    return NextResponse.json({ message: "Success", data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
