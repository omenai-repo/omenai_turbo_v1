"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PayoutDashBoardContent from "./PayoutDashBoardContent";
import { retrieveBalance } from "@omenai/shared-services/stripe/retrieveBalance";
import { TransactionTable } from "./TransactionTable";
import { fetchTransactions } from "@omenai/shared-services/transactions/fetchTransactions";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";
import PayoutSkeleton from "@omenai/shared-ui-components/components/skeletons/PayoutSkeleton";
export default function PayoutDashboard() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = auth_uri();
  if (session === null || session === undefined) router.replace(url);

  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["fetch_payout_dataset"],
    queryFn: async () => {
      try {
        // Ensure session data exists
        if (session === undefined) throw new Error("User not authenticated");

        const acc = await getAccountId(session.email);
        if (!acc?.isOk) throw new Error("Failed to fetch account ID");

        const connectedAccountId = acc.data.connected_account_id;

        // Run independent async calls concurrently
        const [balance, table, response] = await Promise.all([
          retrieveBalance(connectedAccountId),
          fetchTransactions(session.gallery_id as string),
          checkIsStripeOnboarded(connectedAccountId),
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
            <p className="text-fluid-xs font-semibold">
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
          <div className="mt-6">
            <TransactionTable table={isConfirmed.table_data} />
          </div>
        </div>
      )}
    </div>
  );
}
