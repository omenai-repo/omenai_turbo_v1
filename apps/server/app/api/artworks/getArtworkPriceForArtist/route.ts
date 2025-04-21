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

    return NextResponse.json(
      { message: "Proposed Price calculated", price },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
