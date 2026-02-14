"use client";
import React, { useMemo, useState } from "react";
import {
  Accordion,
  ScrollArea,
  Select,
  Loader,
  Text,
  Badge,
} from "@mantine/core";
import { WalletTransactionModelSchemaTypes } from "@omenai/shared-types";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import TransactionHistorySkeleton from "@omenai/shared-ui-components/components/skeletons/TransactionHistorySkeleton";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import { useRollbar } from "@rollbar/react";
import { toast } from "sonner";
import { Calendar, Check, ChevronDown, Clock, X } from "lucide-react";

interface TransactionTableProps {
  walletId: string;
  currentYear: string;
  onYearChange: (year: string, pageCount: number) => void;
}

export default function TransactionTable({
  walletId,
  currentYear,
  onYearChange,
}: TransactionTableProps) {
  const {
    transactions,
    transactionLoading,
    setTransactions,
    setTransactionLoading,
  } = walletTransactionStore();
  const rollbar = useRollbar();

  // Calculate Year Options (2025 -> Today)
  const yearOptions = useMemo(() => {
    const startYear = 2025;
    const todayYear = new Date().getFullYear();
    const years = [];
    for (let y = startYear; y <= todayYear; y++) {
      years.push(y.toString());
    }
    return years.reverse(); // Newest first
  }, []);

  const handleYearSelect = async (val: string | null) => {
    if (!val || val === currentYear) return;

    try {
      setTransactionLoading(true);
      const response = await fetchWalletTransactions(
        walletId,
        val,
        "1", // Reset to page 1
        "10",
        "all",
      );

      if (!response?.isOk)
        throw new Error(response?.message || "Failed to fetch");

      setTransactions(response.data);
      onYearChange(val, response.pageCount); // Update parent state
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast.error("Error", {
        description: "Could not fetch transactions for this year",
      });
    } finally {
      setTransactionLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "text-amber-700",
          badgeColor: "yellow",
          bgColor: "bg-amber-50",
          border: "border-amber-100",
          icon: <Clock size={16} />,
          label: "Processing",
          message:
            "Funds are on the way. This may take up to 24 hours or more depending on your bank's processing time.",
        };
      case "SUCCESSFUL":
        return {
          color: "text-emerald-700",
          bgColor: "bg-emerald-50",
          badgeColor: "green",
          border: "border-emerald-100",
          icon: <Check size={16} />,
          label: "Successful",
          message: "Funds have been deposited successfully.",
        };
      case "FAILED":
        return {
          color: "text-red-700",
          bgColor: "bg-red-50",
          badgeColor: "red",
          border: "border-red-100",
          icon: <X size={16} />,
          label: "Failed",
          message:
            "Transaction failed and funds have been added back to your wallet. Please contact support if you need assistance.",
        };
      default:
        return {
          color: "text-slate-600",
          bgColor: "bg-slate-50",
          border: "border-slate-200",
          icon: null,
          label: status,
          message: "",
        };
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex flex-row items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your withdrawal activity
          </p>
        </div>
        <div className="w-32">
          <Select
            value={currentYear}
            onChange={handleYearSelect}
            data={yearOptions}
            allowDeselect={false}
            disabled={transactionLoading}
            rightSection={
              transactionLoading ? (
                <Loader size={14} />
              ) : (
                <ChevronDown size={14} />
              )
            }
            leftSection={<Calendar size={14} />}
            size="xs"
            classNames={{
              input:
                "font-medium border-slate-200 text-slate-700 focus:border-slate-400",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {transactionLoading ? (
          <div className="p-4">
            <TransactionHistorySkeleton />
          </div>
        ) : transactions.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No records found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              We couldn't find any transactions for {currentYear}.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <Accordion
              variant="separated"
              radius="none"
              className="space-y-0"
              styles={{
                item: {
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: "transparent",
                },
                content: { padding: 0 },
                control: { padding: "12px 20px" },
                chevron: { color: "#cbd5e1" },
              }}
            >
              {transactions.map((transaction: any) => {
                const config = getStatusConfig(transaction.trans_status);
                return (
                  <Accordion.Item
                    key={transaction.trans_id}
                    value={transaction.trans_id}
                  >
                    <Accordion.Control className="hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Withdrawal
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {formatISODate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {formatPrice(transaction.trans_amount, "USD")}
                          </p>
                          <Badge
                            size="xs"
                            variant="light"
                            color={config.badgeColor}
                            className="mt-0.5 font-light"
                          >
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className="px-5 py-4 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Transaction ID</span>
                          <span className="font-mono text-slate-700">
                            {transaction.trans_id}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Reference</span>
                          <span className="font-mono text-slate-700">
                            {transaction.trans_flw_ref_id}
                          </span>
                        </div>
                        {config.message && (
                          <div
                            className={`text-xs p-2 rounded ${config.bgColor} ${config.color} border ${config.border}`}
                          >
                            {config.message}
                          </div>
                        )}
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
