"use client";
import React, { useMemo } from "react";
import { Accordion, ScrollArea, Select, Loader, Badge } from "@mantine/core";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import TransactionHistorySkeleton from "@omenai/shared-ui-components/components/skeletons/TransactionHistorySkeleton";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import { useRollbar } from "@rollbar/react";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  X,
  Building2,
  Landmark,
} from "lucide-react";
import { WithdrawalAccount } from "@omenai/shared-types";

interface TransactionTableProps {
  walletId: string;
  currentYear: string;
  onYearChange: (year: string, pageCount: number) => void;
}

import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

function getCountryName(input: string) {
  if (!input) return null;

  const value = input.trim();

  if (value.length === 2) {
    return countries.getName(value.toUpperCase(), "en") || value;
  }

  const code = countries.getAlpha2Code(value, "en");

  if (code) {
    return countries.getName(code, "en");
  }

  return value;
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

  // Helper component to render Beneficiary Data based on the union type
  const renderBeneficiaryDetails = (beneficiary?: WithdrawalAccount) => {
    if (!beneficiary) return null;

    return (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Building2 size={14} />
          Beneficiary Details
        </h4>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="block text-slate-400 mb-0.5">Account Name</span>
            <span className="font-medium text-slate-800 truncate block">
              {beneficiary.account_name}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 mb-0.5">Bank Country</span>
            <span className="font-medium text-slate-800">
              {getCountryName(beneficiary.bank_country) ||
                beneficiary.bank_country}
            </span>
          </div>

          {/* Conditional Rendering based on Account Type */}
          {beneficiary.type === "us" && (
            <>
              <div>
                <span className="block text-slate-400 mb-0.5">
                  Account Number
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.account_number}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">
                  Routing Number
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.routing_number}
                </span>
              </div>
              {beneficiary.bank_name && (
                <div className="col-span-2">
                  <span className="block text-slate-400 mb-0.5">Bank Name</span>
                  <span className="font-medium text-slate-800">
                    {beneficiary.bank_name}
                  </span>
                </div>
              )}
            </>
          )}

          {beneficiary.type === "africa" && (
            <>
              <div>
                <span className="block text-slate-400 mb-0.5">
                  Account Number
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.account_number}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">Bank Name</span>
                <span className="font-medium text-slate-800">
                  {beneficiary.bank_name}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">Bank Code</span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.bank_code}
                </span>
              </div>
              {beneficiary.branch && (
                <div>
                  <span className="block text-slate-400 mb-0.5">Branch</span>
                  <span className="font-medium text-slate-800">
                    {String(beneficiary.branch)}
                  </span>
                </div>
              )}
            </>
          )}

          {beneficiary.type === "uk" && (
            <>
              <div>
                <span className="block text-slate-400 mb-0.5">
                  Account Number
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.account_number}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">Sort Code</span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.sort_code}
                </span>
              </div>
              {beneficiary.bank_name && (
                <div className="col-span-2">
                  <span className="block text-slate-400 mb-0.5">Bank Name</span>
                  <span className="font-medium text-slate-800">
                    {beneficiary.bank_name}
                  </span>
                </div>
              )}
            </>
          )}

          {beneficiary.type === "eu" && (
            <>
              <div className="col-span-2">
                <span className="block text-slate-400 mb-0.5">IBAN</span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.iban}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">SWIFT Code</span>
                <span className="font-mono font-medium text-slate-800">
                  {beneficiary.swift_code}
                </span>
              </div>
              {beneficiary.bank_name && (
                <div>
                  <span className="block text-slate-400 mb-0.5">Bank Name</span>
                  <span className="font-medium text-slate-800">
                    {beneficiary.bank_name}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
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
              <Landmark size={24} className="text-slate-300" />
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
                  borderBottom: "1px solid #f8fafc",
                  backgroundColor: "transparent",
                },
                content: { padding: 0 },
                control: { padding: "16px 20px" },
                chevron: { color: "#cbd5e1" },
              }}
            >
              {transactions.map((transaction: any) => {
                const config = getStatusConfig(transaction.trans_status);
                const beneficiary = transaction.beneficiary_details as
                  | WithdrawalAccount
                  | undefined;

                return (
                  <Accordion.Item
                    key={transaction.trans_id}
                    value={transaction.trans_id}
                  >
                    <Accordion.Control className="hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Withdrawal
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatISODate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {formatPrice(transaction.trans_amount, "USD")}
                          </p>
                          <Badge
                            size="sm"
                            variant="light"
                            color={config.badgeColor}
                            className="mt-1 font-medium"
                          >
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </Accordion.Control>

                    <Accordion.Panel>
                      <div className="px-6 py-5 bg-slate-50/50">
                        {/* Meta Data Grid */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block text-slate-400 mb-1">
                              Transaction ID
                            </span>
                            <span className="font-mono font-medium text-slate-700 break-all">
                              {transaction.trans_id}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400 mb-1">
                              Reference
                            </span>
                            <span className="font-mono font-medium text-slate-700 break-all">
                              {transaction.trans_flw_ref_id}
                            </span>
                          </div>
                        </div>

                        {/* Beneficiary Details Component */}
                        {renderBeneficiaryDetails(beneficiary)}

                        {/* Status Message */}
                        {config.message && (
                          <div
                            className={`mt-5 text-xs p-3 rounded-md ${config.bgColor} ${config.color} border ${config.border} flex items-start gap-2`}
                          >
                            <div className="mt-0.5">{config.icon}</div>
                            <p className="leading-relaxed">{config.message}</p>
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
