import { FailedCronJobTypes } from "@omenai/shared-types";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";

async function deleteFlutterwaveBeneficiary(
  beneficiary_id: string
): Promise<{ success: boolean; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/beneficiaries/${beneficiary_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    const result = await response.json();

    if (result.status !== "success") {
      return {
        success: false,
        error:
          result.message ??
          "Could not delete beneficiary account from Flutterwave",
      };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeout);
    const message =
      (error as Error).name === "AbortError"
        ? "Request to Flutterwave timed out"
        : ((error as Error).message ??
          "Network error or non-JSON response from Flutterwave");
    return { success: false, error: message };
  }
}

async function deleteBeneficiary(job: FailedCronJobTypes) {
  try {
    const { beneficiary_id } = job.payload;

    if (!beneficiary_id) {
      return {
        success: false,
        jobId: job.jobId,
        error: "Missing beneficiary_id in payload",
      };
    }

    const result = await deleteFlutterwaveBeneficiary(beneficiary_id);

    if (!result.success) {
      await FailedJob.updateOne(
        { jobId: job.jobId },
        { $inc: { retryCount: 1 } }
      );
      return {
        success: false,
        jobId: job.jobId,
        error: result.error || "Failed to delete beneficiary",
      };
    }

    return {
      success: true,
      jobId: job.jobId,
      note: "Beneficiary deleted successfully",
    };
  } catch (error) {
    await FailedJob.updateOne(
      { jobId: job.jobId },
      { $inc: { retryCount: 1 } }
    );
    return {
      success: false,
      jobId: job.jobId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function flutterwaveBeneficiaryService(
  jobs: FailedCronJobTypes[]
) {
  try {
    const promises = jobs.map((job) => deleteBeneficiary(job));
    const results = await Promise.allSettled(promises);
    const successfulJobIds: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.success) {
        successfulJobIds.push(result.value.jobId);
        console.log(
          `Job ${result.value.jobId}: ${result.value.note || "Success"}`
        );
      } else if (result.status === "fulfilled") {
        console.warn(`Job ${result.value.jobId} failed: ${result.value.error}`);
      }
    });

    if (successfulJobIds.length > 0) {
      await FailedJob.deleteMany({
        jobId: { $in: successfulJobIds },
      });
      console.log(`Cleaned up ${successfulJobIds.length} successful jobs`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
