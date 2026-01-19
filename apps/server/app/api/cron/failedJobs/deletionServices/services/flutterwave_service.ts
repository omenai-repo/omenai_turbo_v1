import { FailedCronJobTypes } from "@omenai/shared-types";
import { handleDeleteWithRetry, processFailedJobs } from "./utils";

async function deleteFlutterwaveBeneficiary(
  beneficiary_id: string
): Promise<{ success: boolean; error?: string; deletedCount: number }> {
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
        deletedCount: 0,
        error:
          result.message ??
          "Could not delete beneficiary account from Flutterwave",
      };
    }

    return { success: true, deletedCount: 1 };
  } catch (error) {
    clearTimeout(timeout);
    const message =
      (error as Error).name === "AbortError"
        ? "Request to Flutterwave timed out"
        : ((error as Error).message ??
          "Network error or non-JSON response from Flutterwave");
    return { success: false, error: message, deletedCount: 0 };
  }
}

export async function flutterwaveService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) =>
    handleDeleteWithRetry(job.payload.beneficiary_id, () =>
      deleteFlutterwaveBeneficiary(job.payload.beneficiary_id)
    )
  );
}
