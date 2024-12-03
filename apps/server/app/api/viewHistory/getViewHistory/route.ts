import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { user_id } = await request.json();

    const recentlyViewed = await RecentView.find({ user: user_id })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(
      {
        message: "Successful",
        data: recentlyViewed,
      },
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
