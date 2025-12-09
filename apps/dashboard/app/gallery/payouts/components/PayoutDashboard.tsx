"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PayoutDashBoardContent from "./PayoutDashBoardContent";
import { retrieveBalance } from "@omenai/shared-services/stripe/retrieveBalance";
import { TransactionTable } from "./TransactionTable";
import { fetchTransactions } from "@omenai/shared-services/transactions/fetchTransactions";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { LoadIcon } from "@omenai/shared-ui-components/components/loader/Load";
import PayoutSkeleton from "@omenai/shared-ui-components/components/skeletons/PayoutSkeleton";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
export default function PayoutDashboard() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const rollbar = useRollbar();
  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["fetch_payout_dataset"],
    queryFn: async () => {
      try {
        // Ensure user data exists

        const acc = await getAccountId(user.gallery_id, csrf || "");
        if (!acc?.isOk) throw new Error("Failed to fetch account ID");

        const connectedAccountId = acc.data.connected_account_id;

        // Run independent async calls concurrently
        const [balance, table, response] = await Promise.all([
          retrieveBalance(connectedAccountId, csrf || ""),
          fetchTransactions(user.gallery_id as string, csrf || ""),
          checkIsStripeOnboarded(connectedAccountId, csrf || ""),
        ]);

        // Check if all results are okay
        if (!balance?.isOk || !table?.isOk || !response?.isOk) {
          throw new Error("Something went wrong, Please refresh the page");
        }

        // Return final data if all checks passed
        return {
          isSubmitted: response.details_submitted,
          id: connectedAccountId,
          balance: balance.data,
          table_data: table.data,
        };
      } catch (error) {
        if (error instanceof Error) {
          rollbar.error(error);
        } else {
          rollbar.error(new Error(String(error)));
        }
        console.error(error);
        throw new Error("Something went wrong, Please refresh the page");
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="mt-10">
        <PayoutSkeleton />
      </div>
    );
  }

  if (!isConfirmed!.isSubmitted)
    router.replace(`/gallery/payouts/refresh?id=${isConfirmed!.id}`);

  return (
    <div>
      {!isConfirmed?.isSubmitted ? (
        <div className="h-[85vh] w-full grid place-items-center">
          <div className="flex flex-col space-y-1">
            <LoadIcon />
            <p className="text-fluid-xxs font-semibold">
              Redirecting...Please wait
            </p>
          </div>
        </div>
      ) : (
        <div className="my-10">
          <PayoutDashBoardContent
            account={isConfirmed.id}
            balance={isConfirmed.balance}
          />
          <div className="my-6">
            <TransactionTable table={isConfirmed.table_data} />
          </div>
        </div>
      )}
    </div>
  );
}
