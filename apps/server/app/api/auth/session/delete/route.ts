import { deleteSession } from "@omenai/shared-auth/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ message: "Successful" }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
