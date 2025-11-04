"use client";
import React from "react";
import { Accordion, ScrollArea } from "@mantine/core";
import { WalletTransactionModelSchemaTypes } from "@omenai/shared-types";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import TransactionHistorySkeleton from "@omenai/shared-ui-components/components/skeletons/TransactionHistorySkeleton";

export default function TransactionTable() {
  const { transactions, transactionLoading } = walletTransactionStore();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          label: "Processing",
          message:
            "Your funds are on their way to your bank account. This may take a little time—thank you for your patience.",
        };
      case "SUCCESSFUL":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          label: "Completed",
          message:
            "Your funds have been successfully deposited into your bank account",
        };
      case "FAILED":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          label: "Failed",
          message:
            "Your funds transfer was unsuccessful. Please check your bank details or contact support for assistance",
        };
      default:
        return {
          color: "text-slate-600",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          icon: null,
          label: status,
          message: "",
        };
    }
  };

  const items = transactions.map(
    (
      transaction: WalletTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      }
    ) => {
      const statusConfig = getStatusConfig(transaction.trans_status);

      return (
        <Accordion.Item
          key={transaction.trans_id}
          value={transaction.trans_id}
          className="border border-slate-200 rounded mb-3 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <Accordion.Control className="hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div
                  className={`p-3 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  {statusConfig.icon || (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  )}
                </div>

                {/* Transaction Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-fluid-xxs text-dark">
                      Withdrawal
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color} font-medium`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-fluid-xxs text-slate-500">
                    {formatISODate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-fluid-base font-semibold text-dark">
                  {formatPrice(transaction.trans_amount, "USD")}
                </p>
              </div>
            </div>
          </Accordion.Control>

          <Accordion.Panel className="border-t border-slate-200 bg-slate-50">
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Transaction ID
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-dark">
                        {transaction.trans_id}
                      </p>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(transaction.trans_id)
                        }
                        className="p-1 rounded hover:bg-slate-200 transition-colors"
                        title="Copy ID"
                      >
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Reference
                    </span>
                    <p className="font-mono text-sm text-dark">
                      {transaction.trans_flw_ref_id}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Amount
                    </span>
                    <p className="text-lg font-semibold text-dark">
                      {formatPrice(transaction.trans_amount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Date
                    </span>
                    <p className="text-sm text-dark">
                      {formatISODate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div
                className={`mt-6 p-4 rounded ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <div className="">
                    <p
                      className={`font-medium text-fluid-xxs ${statusConfig.color}`}
                    >
                      {transaction.trans_status}
                    </p>
                    <p className="text-fluid-xxs text-slate-600">
                      {statusConfig.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      );
    }
  );

  return (
    <div className="w-full">
      {transactionLoading ? (
        <TransactionHistorySkeleton />
      ) : (
        <>
          {transactions.length === 0 ? (
            <div className="bg-slate-50 rounded border-2 border-dashed border-slate-300 p-12">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-sm text-slate-600">
                  Your withdrawal history will appear here once you make your
                  first transaction.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-dark">
                  Transaction History
                </h2>
                <span className="text-sm text-slate-500">
                  <Link
                    href=""
                    className="text-fluid-xxs underline font-medium"
                  >
                    See all
                  </Link>
                </span>
              </div>
              <ScrollArea h={600} className="pr-4">
                <Accordion
                  variant="separated"
                  radius="md"
                  className="space-y-0"
                  styles={{
                    content: { padding: 0 },
                    control: { padding: 0 },
                    item: {
                      backgroundColor: "transparent",
                      border: "none",
                    },
                  }}
                >
                  {items}
                </Accordion>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}
