import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import {
  RateLimitExceededError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { createSession } from "@omenai/shared-auth/lib/auth/session";

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

    const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
      email,
    }).exec();

    if (!user) throw new ConflictError("Invalid credentials");

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
    const { user_id, verified, name, preferences, role } = user;

    const session_payload = {
      user_id,
      verified,
      name,
      preferences,
      role,
      email: user.email,
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
