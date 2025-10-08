"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchSubscriptionTransactions } from "@omenai/shared-services/transactions/fetchSubscriptionTransactions";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useContext } from "react";

export default function TransactionTable() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["fetch_sub_trans"],
    queryFn: async () => {
      const trans = await fetchSubscriptionTransactions(
        user.gallery_id as string,
        csrf || ""
      );
      if (trans?.isOk) return trans.data;
      else throw new Error("Something went wrong");
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) return <Load />;

  const reversedTransactions = transactions.slice().reverse();
  return (
    <div className=" bg-white rounded shadow-sm border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-dark mb-6">
        Recent Transaction Activity
      </h2>

      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
        {reversedTransactions.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>

            {/* Transaction Items */}
            {reversedTransactions.map((transaction: any, index: number) => (
              <div
                key={transaction.trans_id}
                className="relative flex items-start gap-4 pb-6 last:pb-0"
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-fluid-xxs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-50 rounded p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-fluid-xxs font-semibold text-slate-500 mt-0.5">
                        #{transaction.trans_id}
                      </p>
                      <p
                        className={`text-fluid-xxs font-medium ${
                          transaction.status === "successful"
                            ? "text-green-600"
                            : transaction.status === "failed"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {transaction.status === "successful"
                          ? "Payment processed successfully"
                          : transaction.status === "failed"
                            ? "Payment failed"
                            : "Payment pending"}
                      </p>
                      <p className="text-fluid-xxs text-slate-600 mt-1">
                        {formatISODate(transaction.date)}
                      </p>
                    </div>
                    <p className="font-semibold text-dark">
                      {formatPrice(transaction.amount, "USD")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <NotFoundData />
            <p className="text-fluid-xxs text-slate-500 mt-2">
              No transactions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
