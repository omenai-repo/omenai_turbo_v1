import { NextRequest, NextResponse } from "next/server";
import { HEADERS } from "../resources";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";

export async function POST(request: NextRequest) {
  const { tracking_number } = await request.json();

  if (!tracking_number)
    throw new BadRequestError("Invalid parameters - Tracking number required");

  const API_URL = `https://express.api.dhl.com/mydhlapi/test/shipments/${tracking_number}/tracking?trackingView=all-checkpoints&levelOfDetail=shipment`;

  const url = new URL(API_URL);
  const requestOptions = {
    method: "GET",
    headers: HEADERS,
  };

  try {
    const response = await fetch(url.toString(), requestOptions);
    if (!response.ok)
      throw new ServerError(
        "Something went wrong. Please try again or contact support"
      );

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Successfully fetched shipment events",
        events: data.shipments[0].events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
