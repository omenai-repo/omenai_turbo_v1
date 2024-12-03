import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { user_id, art_id } = await request.json();
    const release_lock = await LockMechanism.deleteOne({ user_id, art_id });

    if (!release_lock)
      throw new ServerError("Something went wrong, Please try again.");

    return NextResponse.json(
      {
        message: "Lock released",
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
