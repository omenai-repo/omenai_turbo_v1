"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchSubscriptionTransactions } from "@omenai/shared-services/transactions/fetchSubscriptionTransactions";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { useQuery } from "@tanstack/react-query";

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

  if (isLoading)
    return (
      <div className="h-full bg-white rounded border border-slate-100 p-8 flex items-center justify-center">
        <Load />
      </div>
    );

  const reversedTransactions = transactions?.slice().reverse() || [];

  return (
    <div className="h-full  bg-white rounded border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction History
        </h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {reversedTransactions.length} Records
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {reversedTransactions.length > 0 ? (
          <div className="relative space-y-0">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-6 w-px bg-slate-200" />

            {reversedTransactions.map((transaction: any) => (
              <div
                key={transaction.trans_id}
                className="relative pl-12 pb-8 last:pb-0 group"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute left-0 top-1 w-10 h-10 rounded border-4 border-white flex items-center justify-center z-10 shadow-sm transition-colors ${
                    transaction.status === "successful"
                      ? "bg-emerald-50 text-emerald-600"
                      : transaction.status === "failed"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded ${
                      transaction.status === "successful"
                        ? "bg-emerald-500"
                        : transaction.status === "failed"
                          ? "bg-red-500"
                          : "bg-amber-500"
                    }`}
                  />
                </div>

                {/* Card Body */}
                <div className="flex justify-between items-start p-4 rounded border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">
                      {formatISODate(transaction.date)}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {transaction.status === "successful"
                        ? "Subscription Payment"
                        : "Attempted Charge"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-mono">
                      TRANSACTION ID: {transaction.trans_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(transaction.amount, "USD")}
                    </p>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize mt-1 inline-block ${
                        transaction.status === "successful"
                          ? "bg-emerald-100 text-emerald-700"
                          : transaction.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <NotFoundData />
            <p className="text-sm text-slate-500 mt-4">
              No transaction history available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
