import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import {
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";
import { anonymizeUserId } from "../../../util";

export async function deleteFlutterwaveBeneficiary(
  beneficiary_id: string
): Promise<{ success: boolean; error?: string; deletedCount: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

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

/**
 * Handles wallet anonymization and beneficiary deletion on account deletion.
 */
export async function walletDeletionProtocol(
  targetId: string
): Promise<DeletionReturnType> {
  const stats = {
    failedJobCreations: 0,
    anonymizedWallet: false,
    beneficiaryDeleted: false,
  };

  try {
    // Step 1: Validate Target ID
    const checkIdvalidity = validateTargetId(targetId);
    if (!checkIdvalidity.success)
      throw new Error(checkIdvalidity.error ?? "Invalid target ID");

    // Step 2: Find user wallet
    const wallet = await Wallet.findOne(
      { owner_id: targetId },
      "primary_withdrawal_account"
    ).lean<{
      primary_withdrawal_account?: { beneficiary_id?: string };
    } | null>();

    if (!wallet)
      return { success: true, count: { ...stats }, note: "No wallet found." };

    const beneficiary_id = wallet.primary_withdrawal_account?.beneficiary_id;

    // Step 3: Delete Flutterwave beneficiary if exists
    if (beneficiary_id) {
      const result = await deleteFlutterwaveBeneficiary(beneficiary_id);

      if (!result.success) {
        const created = await createFailedTaskJob({
          error: result.error!,
          payload: { beneficiary_id },
          jobType: "delete_flutterwave_beneficiary_id",
          taskId: `wallet_service:${beneficiary_id}`,
        });

        if (!created) stats.failedJobCreations++;
      } else {
        stats.beneficiaryDeleted = true;
      }
    } else {
      stats.beneficiaryDeleted = true; // No beneficiary to delete
    }

    // Step 4: Anonymize wallet
    const anonymizeWallet = await Wallet.updateOne(
      { owner_id: targetId },
      {
        $set: {
          owner_id: anonymizeUserId(targetId, process.env.ANONYMIZE_SECRET!),
          pending_balance: 0,
          available_balance: 0,
          wallet_pin: null,
          primary_withdrawal_account: null,
          base_currency: "",
        },
      }
    );

    if (anonymizeWallet.modifiedCount === 1) {
      stats.anonymizedWallet = true;
    } else {
      const created = await createFailedTaskJob({
        error:
          "Could not anonymize user wallet data. Matched: " +
          anonymizeWallet.matchedCount,
        payload: { targetId },
        jobType: "anonymize_wallet_data",
        taskId: `wallet_service:${targetId}`,
      });

      if (!created) stats.failedJobCreations++;
    }

    return {
      success: true,
      count: { ...stats },
      note: "Deletion protocol successfully completed",
    };
  } catch (error) {
    console.error(
      `Unable to execute wallet deletion protocol for user: ${targetId}`,
      (error as Error).message
    );

    return {
      success: false,
      count: { ...stats },
      note: "An error occured during deletion, manual intervention in progress",
      error: (error as Error).message,
    };
  }
}
