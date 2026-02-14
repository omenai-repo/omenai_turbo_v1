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
    const updateResult = await FailedJob.updateOne(
      { jobId: job.jobId },
      {
        $inc: { retryCount: 1 },
        $set: { lastAttemptedAt: new Date() },
      }
    );

    return updateResult.modifiedCount > 0;
  } else {
    const createdJob = await FailedJob.create({
      ...job,
      retryCount: 1,
      lastAttemptedAt: new Date(),
      scheduledAt: new Date(),
    });

    return !!createdJob;
  }
}
