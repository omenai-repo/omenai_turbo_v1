import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { getApiUrl } from "@omenai/url-config/src/config";
import { NextResponse } from "next/server";
import pLimit from "p-limit";
import { createErrorRollbarReport } from "../../../util";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const MAX_RETRIES = 5;
const MAX_CONCURRENT_JOBS = 3; // Limit concurrent API calls
const BASE_DELAY_MS = 1000; // Base delay for exponential backoff

// Exponential backoff with jitter
function calculateDelay(retryCount: number): number {
  const exponentialDelay = BASE_DELAY_MS * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
}

// Check if enough time has passed since last retry
function shouldRetryNow(job: any): boolean {
  if (!job.lastRetryAt) return true;

  const timeSinceLastRetry = Date.now() - new Date(job.lastRetryAt).getTime();
  const requiredDelay = calculateDelay(job.retryCount || 0);

  return timeSinceLastRetry >= requiredDelay;
}

async function processJob(
  job: any
): Promise<{ success: boolean; error?: string }> {
  try {
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
      return { success: true };
    } else {
      const errorText = await res.text().catch(() => "Unknown error");
      const newRetryCount = (job.retryCount || 0) + 1;
      const status =
        newRetryCount >= MAX_RETRIES ? "failed_permanently" : "pending";

      await FailedJob.updateOne(
        { _id: job._id },
        {
          $inc: { retryCount: 1 },
          $set: {
            reason: `HTTP ${res.status}: ${errorText}`,
            status,
            lastRetryAt: new Date(),
          },
        }
      );

      return {
        success: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const newRetryCount = (job.retryCount || 0) + 1;
    const status =
      newRetryCount >= MAX_RETRIES ? "failed_permanently" : "pending";

    await FailedJob.updateOne(
      { _id: job._id },
      {
        $inc: { retryCount: 1 },
        $set: {
          reason: `Network/Parse Error: ${errorMessage}`,
          status,
          lastRetryAt: new Date(),
        },
      }
    );

    return { success: false, error: errorMessage };
  }
}

// Run every hour
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    const allFailedJobs = await FailedJob.find({
      jobType: "createShipment",
      status: "pending",
      retryCount: { $lt: MAX_RETRIES },
    });

    if (!allFailedJobs.length) {
      return NextResponse.json({
        message: "No failed jobs to retry",
        processed: 0,
      });
    }

    // Filter jobs that are ready for retry (respecting backoff delays)
    const jobsReadyForRetry = allFailedJobs.filter(shouldRetryNow);

    if (!jobsReadyForRetry.length) {
      return NextResponse.json({
        message: "No jobs ready for retry (waiting for backoff delays)",
        totalPending: allFailedJobs.length,
        processed: 0,
      });
    }

    console.log(
      `Processing ${jobsReadyForRetry.length} jobs with max concurrency: ${MAX_CONCURRENT_JOBS}`
    );

    // Create concurrency limiter
    const limit = pLimit(MAX_CONCURRENT_JOBS);

    // Process jobs in parallel with concurrency limit
    const results = await Promise.allSettled(
      jobsReadyForRetry.map((job) => limit(() => processJob(job)))
    );

    // Analyze results
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          successful++;
        } else {
          failed++;
          if (result.value.error) {
            errors.push(
              `Job ${jobsReadyForRetry[index]._id}: ${result.value.error}`
            );
          }
        }
      } else {
        failed++;
        errors.push(
          `Job ${jobsReadyForRetry[index]._id}: Promise rejected - ${result.reason}`
        );
      }
    });

    // Log summary
    console.log(
      `✅ Retry completed: ${successful} successful, ${failed} failed`
    );
    if (errors.length > 0) {
      console.log("❌ Errors:", errors.slice(0, 5)); // Log first 5 errors
    }

    return NextResponse.json({
      message: "Failed job retry completed",
      totalPending: allFailedJobs.length,
      readyForRetry: jobsReadyForRetry.length,
      processed: results.length,
      successful,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors in response
      concurrency: MAX_CONCURRENT_JOBS,
    });
  } catch (error) {
    createErrorRollbarReport("Cron: Failed Job Retry - Shipments", error, 500);
    console.error("[failed-job-retry] Error:", error);
    return NextResponse.json(
      {
        message: "Failed job retry cron failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
