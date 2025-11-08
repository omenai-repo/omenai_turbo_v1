import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { ServerError } from "../../../custom/errors/dictionary/errorDictionary";
import { DeletionTaskServiceType, EntityType } from "@omenai/shared-types";
export interface Commitment {
  type: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface DeletionCommitmentResult {
  can_delete: boolean;
  commitments: Commitment[];
}

export function generateDeletionCommitments(params: {
  hasActiveOrder?: boolean;
  hasActiveSubscription?: boolean;
  hasPendingWithdrawal?: boolean;
  hasUnpaidStripeBalance?: boolean;
  hasUnpaidWalletBalance?: boolean;
}): DeletionCommitmentResult {
  const commitments: Commitment[] = [];

  if (params.hasActiveOrder) {
    commitments.push({
      type: "order_commitment",
      description:
        "You currently have an order that’s been accepted and is still being processed. Account deletion will only be possible once the order has been fulfilled.",
    });
  }

  if (params.hasActiveSubscription) {
    commitments.push({
      type: "subscription_commitment",
      description:
        "You have an active subscription. Please cancel or wait for it to expire before deleting your account.",
    });
  }

  if (params.hasPendingWithdrawal) {
    commitments.push({
      type: "withdrawal_commitment",
      description:
        "A withdrawal request is currently pending. Please allow it to complete before deleting your account.",
    });
  }

  if (params.hasUnpaidStripeBalance) {
    commitments.push({
      type: "financial_commitment",
      description:
        "You have an unpaid balance or unsettled payment on your Stripe connected account. Please allow for settlement before deleting your account.",
    });
  }
  if (params.hasUnpaidWalletBalance) {
    commitments.push({
      type: "financial_commitment",
      description:
        "You have a pending or available balance in your wallet. Please allow for settlement before deleting your account.",
    });
  }

  return {
    can_delete: commitments.length === 0,
    commitments,
  };
}

/**
 * Calculates the end date for a grace period based on the given number of days.
 * Ensures the date is stored in UTC format for consistency.
 *
 * @param {number} days - Number of days for the grace period (default: 30)
 * @param {Date} [fromDate] - Optional starting point (defaults to now)
 * @returns {Date} Grace period end date in UTC
 */
export function calculateGracePeriod(days: number = 30, fromDate?: Date): Date {
  const start = fromDate ? toUTCDate(fromDate) : toUTCDate(new Date());
  const graceEnd = new Date(start);
  graceEnd.setUTCDate(graceEnd.getUTCDate() + days);
  return graceEnd;
}

export async function hasActiveStripeBalance(
  connectedStripeId: string
): Promise<{ isBalance: boolean; balance: any }> {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedStripeId,
    });

    // Check if ANY currency bucket in 'available' has a positive amount.
    const hasAvailableFunds = balance.available.some(
      (b: { amount: number }) => b.amount > 0
    );

    // Check if ANY currency bucket in 'pending' has a positive amount.
    const hasPendingFunds = balance.pending.some(
      (b: { amount: number }) => b.amount > 0
    );

    // If there are positive funds in ANY currency (available OR pending), block deletion.
    const isBalance = hasAvailableFunds || hasPendingFunds;

    return { isBalance, balance };
  } catch (error) {
    console.error("Stripe balance check failed:", error);
    // Best practice: Throwing a generic error prevents leaking internal Stripe error details
    throw new Error("Failed to verify Stripe balance for connected account.");
  }
}

// Utitlity function to check wallet financial commitments

/**
 * Checks if a wallet has active financial commitments such as
 * a non-zero balance or pending transactions.
 */
export async function hasFinancialCommitments(walletId: string): Promise<{
  hasPositiveBalance: boolean;
  hasPendingTransactions: boolean;
  hasAnyCommitment: boolean;
}> {
  // Check wallet balance (pending or available > 0)
  const wallet = await Wallet.findOne({
    wallet_id: walletId,
    $or: [{ pending_balance: { $gt: 0 } }, { available_balance: { $gt: 0 } }],
  });

  const hasPositiveBalance = !!wallet;

  // Check for pending transactions (case-insensitive)
  const pendingTransaction = await WalletTransaction.exists({
    wallet_id: walletId,
    trans_status: { $regex: /^pending$/i },
  });

  const hasPendingTransactions = !!pendingTransaction;

  return {
    hasPositiveBalance,
    hasPendingTransactions,
    hasAnyCommitment: hasPositiveBalance || hasPendingTransactions,
  };
}

/**
 * Creates a deletion request for any entity type.
 *
 * @param params.targetId - ID of the entity to delete
 * @param params.reason - Reason for deletion
 * @param params.entityType - The type of entity (e.g., "artist", "gallery", "individual")
 * @param params.initiatedBy - Who initiated it ("target", "admin", or "system")
 * @param params.gracePeriodDays - Number of days before deletion executes (default: 30)
 */
export async function createDeletionRequestAndRespond({
  targetId,
  reason,
  entityType,
  initiatedBy = "target",
  gracePeriodDays = 30,
  email,
}: {
  targetId: string;
  reason: string;
  email: string;
  entityType: Exclude<EntityType, "admin">;
  initiatedBy?: "target" | "admin" | "system";
  gracePeriodDays?: number;
}) {
  const today = toUTCDate(new Date());
  const gracePeriodEnd = calculateGracePeriod(gracePeriodDays, today);

  const deletionRequest = await DeletionRequestModel.create({
    targetId,
    initiatedBy,
    entityType,
    reason,
    requestedAt: today,
    gracePeriodUntil: gracePeriodEnd,
    services: serviceMap[entityType],
    metadata: { targetId },
    targetEmail: email,
  });

  if (!deletionRequest) {
    throw new ServerError(
      "Account deletion failed, failed to create deletion request"
    );
  }

  return gracePeriodEnd;
}

export const serviceMap: Record<
  Exclude<EntityType, "admin">,
  DeletionTaskServiceType[]
> = {
  user: [
    "order_service",
    "purchase_transaction_service",
    "account_service",
    "misc_service",
  ],
  artist: [
    "order_service",
    "wallet_service",
    "categorization_service",
    "upload_service",
    "account_service",
    "sales_service",
    "misc_service",
  ],
  gallery: [
    "order_service",
    "subscriptions_service",
    "upload_service",
    "account_service",
    "sales_service",
    "misc_service",
  ],
};
