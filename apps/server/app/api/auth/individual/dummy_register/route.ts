import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { NextResponse } from "next/server";

import { Token, createClerkClient } from "@clerk/express";
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST() {
  try {
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: ["dantereus1@gmail.com"],
      password: "Test12345@", // Clerk handles hashing separately
      firstName: "Moses",
      lastName: "Chukwunekwu",
    });

    if (!clerkUser.id) throw new ServerError("Unable to create clerk user");
    return NextResponse.json({
      message: "Clerk user created",
      id: clerkUser.id,
    });
  } catch (error) {
    console.error("Full error object:", JSON.stringify(error, null, 2));
  }
}
