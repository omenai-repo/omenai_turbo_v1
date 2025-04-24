import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { connectMongoDB } from "../mongo_connect/mongoConnect";

export async function saveFailedJob(job: {
  jobId: string;
  jobType: string;
  payload: any;
  reason: string;
}) {
  await connectMongoDB();

  const existing = await FailedJob.findOne({ jobId: job.jobId });

  if (existing) {
    await FailedJob.updateOne(
      { jobId: job.jobId },
      {
        $inc: { retryCount: 1 },
        $set: { lastAttemptedAt: new Date() },
      }
    );
    console.log(`Incremented retryCount for existing job ${job.jobId}`);
  } else {
    await FailedJob.create({
      ...job,
      retryCount: 1,
      lastAttemptedAt: new Date(),
      scheduledAt: new Date(),
    });
    console.log(`Saved new failed job ${job.jobId}`);
  }
}
