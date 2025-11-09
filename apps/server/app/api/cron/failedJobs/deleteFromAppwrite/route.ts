import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { serverStorage, storage } from "@omenai/appwrite-config";

export async function GET() {
  try {
    await connectMongoDB();

    const failed_appwrite_jobs = await FailedJob.find({
      jobType: "delete_artwork_from_appwrite",
    }).lean();

    if (!failed_appwrite_jobs)
      return NextResponse.json({ message: "No Failed appwrite uploads found" });

    const taskPromise: { payload: any; fn: Promise<void | {}> }[] = [];
    for (const job of failed_appwrite_jobs) {
      const { payload } = job;

      taskPromise.push({
        fn: serverStorage
          .deleteFile({
            bucketId: process.env.APPWRITE_BUCKET_ID!,
            fileId: payload.appwriteId,
          })
          .catch((err) => {
            console.error(
              `❌ Failed to delete file ${payload.appwriteId}:`,
              err.message
            );
            console.log(`Bucked ID: ${process.env.APPWRITE_BUCKET_ID!}`);
          }),

        payload,
      });
    }

    const fulfilledJobs: { payload: { appwriteId: string } }[] = [];
    const rejectedUpdates: { payload: { appwriteId: string } }[] = [];

    if (taskPromise.length > 0) {
      const result = await Promise.allSettled(
        taskPromise.map((task) => task.fn)
      );

      result.forEach((res: any, index: number) => {
        const { payload } = taskPromise[index];
        if (res.status === "fulfilled") {
          fulfilledJobs.push({ payload });
        } else {
          rejectedUpdates.push(payload);
        }
      });
    }

    return NextResponse.json({ message: fulfilledJobs, rejectedUpdates });
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
}
