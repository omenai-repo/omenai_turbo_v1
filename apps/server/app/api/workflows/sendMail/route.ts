import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { TestCollection } from "@omenai/shared-models/models/test/TestSchema";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";

type Payload = {
  title: string;
};
export const { POST } = serve<Payload[]>(async (ctx) => {
  const payload: Payload[] = ctx.requestPayload;
  await connectMongoDB();
  const [first, second, third] = await Promise.all([
    ctx.run("create_new_tes", async () => await TestCollection.create(payload)),
    ctx.run(
      "create_another",
      async () => await TestCollection.create({ title: "Hey soul sister" })
    ),
    ctx.run(
      "another_one",
      async () => await TestCollection.create({ title: "This is good" })
    ),
  ]);
  if (first && second && third)
    return NextResponse.json({ data: "Successful" }, { status: 201 });
});
