import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { getApiUrl } from "@omenai/url-config/src/config";
import { NextResponse } from "next/server";

export async function POST() {
  await connectMongoDB();
  const jobs = await FailedJob.find({
    jobType: "createShipment",
    status: "pending",
  }).limit(10);

  for (const job of jobs) {
    const { payload } = job;

    const res = await fetch(
      `${getApiUrl()}/api/workflows/shipment/createShipment`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.ok) {
      await FailedJob.updateOne(
        { _id: job._id },
        { $set: { status: "reprocessed" } }
      );
    } else {
      await FailedJob.updateOne(
        { _id: job._id },
        { $inc: { retryCount: 1 }, $set: { reason: "Retry failed" } }
      );
    }
  }

  return NextResponse.json({ success: true });
}
