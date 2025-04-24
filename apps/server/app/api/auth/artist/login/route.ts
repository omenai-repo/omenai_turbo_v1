import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes, IndividualSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import {
  RateLimitExceededError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createSession } from "@omenai/shared-auth/lib/auth/session";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { email, password } = data;

    // const ip = await getIp();

    // const { success } = await limiter.limit(ip);

    // if (!success)
    //   throw new RateLimitExceededError(
    //     "Too many login attempts, try again after 1 hour."
    //   );

    await connectMongoDB();

    const artist = await AccountArtist.findOne<ArtistSchemaTypes>({
      email,
    }).exec();

    if (!artist) throw new ConflictError("Invalid credentials");

    const isPasswordMatch = bcrypt.compareSync(password, artist.password);

    if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
    const {
      artist_id,
      verified,
      name,
      role,
      isOnboardingCompleted,
      artist_verified,
      logo,
      base_currency,
      wallet_id,
      address,
      phone,
      categorization,
    } = artist;

    const session_payload = {
      artist_id,
      verified,
      name,
      role,
      email: artist.email,
      isOnboardingCompleted,
      artist_verified,
      logo,
      base_currency,
      wallet_id,
      address,
      phone,
      categorization,
    };

    await createSession(session_payload);

    return res.json(
      {
        message: "Login successfull",
        data: session_payload,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
