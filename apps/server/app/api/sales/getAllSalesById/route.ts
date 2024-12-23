import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { id } = await request.json();
    const allSales = await SalesActivity.find({ gallery_id: id }, "_id").exec();

    return NextResponse.json(
      {
        message: "Successful",
        data: allSales,
      },
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
