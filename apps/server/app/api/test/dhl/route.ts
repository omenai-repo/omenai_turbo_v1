import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const API_KEY = (process.env.API_KEY || "").trim();
  const API_SECRET = (process.env.API_SECRET || "").trim();

  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString(
    "base64"
  );
  const { type, countryCode, postalCode, cityName, countyName } =
    await request.json();

  if (!type || !countryCode || !postalCode || !cityName || !countyName) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Missing required fields: [type, countryCode, postalCode, cityName, countyName]",
      },
      { status: 400 }
    );
  }
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-version", "2.12.0");
    myHeaders.append("Authorization", `Basic ${credentials}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    const response = await fetch(
      `https://express.api.dhl.com/mydhlapi/test/address-validate?type=${type}&countryCode=${countryCode}&cityName=${cityName}&postalCode=${postalCode}&countyName=${countyName}&strictValidation=true`,
      requestOptions
    );
    const data = await response.json();
    return NextResponse.json({ message: "Success", data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
