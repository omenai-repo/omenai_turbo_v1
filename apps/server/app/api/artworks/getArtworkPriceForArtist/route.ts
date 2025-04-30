import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { ArtistCategory, ArtworkMediumTypes } from "@omenai/shared-types";
import { calculatePrice } from "@omenai/shared-lib/algorithms/priceGenerator";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const medium: ArtworkMediumTypes = searchParams.get(
    "medium"
  ) as ArtworkMediumTypes;

  const height = searchParams.get("height") as string;
  const width = searchParams.get("width") as string;
  const category: ArtistCategory = searchParams.get(
    "category"
  ) as ArtistCategory;
  const currency = searchParams.get("currency") as string;
  try {
    if (!medium || !height || !width || !category) {
      throw new ServerError(
        "Missing required parameters (medium, height, width, category)"
      );
    }
    if (isNaN(+height) || isNaN(+width))
      throw new BadRequestError("Height or width must be a number");
    const price = calculatePrice(category, medium, +height, +width);

    if (typeof price !== "number" || price <= 0) {
      throw new ServerError("Price calculation failed");
    }

    // Get currency rate
    const response = await fetch(
      `https://api.omenai.app/api/flw/getTransferRate?source=${currency.toUpperCase()}&destination=USD&amount=${price}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://omenai.app",
        },
      }
    );

    if (!response.ok)
      throw new ServerError(
        "Failed to calculate Price. Try again or contact support"
      );
    const result = await response.json();

    const price_response_data = {
      price: result.data.source.amount,
      usd_price: price,
      shouldShowPrice: "Yes",
      currency,
    };

    return NextResponse.json(
      { message: "Proposed Price calculated", data: price_response_data },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
