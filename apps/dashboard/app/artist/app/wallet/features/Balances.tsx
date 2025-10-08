"use client";
import React, { useState } from "react";
import CurrencyDropdown from "../components/CurrencyDropdown";
import { Divider, Tooltip } from "@mantine/core";
import { Eye, EyeOff, Info } from "lucide-react";
import Link from "next/link";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { WithdrawalAccount } from "@omenai/shared-types";
import { toast } from "sonner";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

export default function Balances({
  available,
  pending,
  currency,
  withdrawal_account,
}: {
  available: number;
  pending: number;
  currency: string;
  withdrawal_account: WithdrawalAccount | null;
}) {
  const [showBalance, setShowBalance] = useState(false);
  const { toggleWithdrawalFormPopup } = artistActionStore();

  const toggleForm = () => {
    if (withdrawal_account === null) {
      toast.error("Error notification", {
        description: "Please add a primary bank account to make withdrawals",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });

      return;
    }
    toggleWithdrawalFormPopup(true);
  };
  return (
    <div className="bg-dark text-white rounded shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded">
              <svg
                className="w-5 h-5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                />
              </svg>
            </div>
            <h4 className="text-fluid-base font-semibold">Wallet Balance</h4>
          </div>
          <CurrencyDropdown />
        </div>
      </div>

      {/* Balance Section */}
      <div className="p-6 space-y-3">
        {/* Available Balance */}
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-fluid-xxs text-slate-400">Available Balance</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 rounded transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? (
                  <Eye size={18} strokeWidth={1.5} className="text-slate-400" />
                ) : (
                  <EyeOff
                    size={18}
                    strokeWidth={1.5}
                    className="text-slate-400"
                  />
                )}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-fluid-lg font-semibold tracking-tight">
                {showBalance ? formatPrice(available, "USD") : "••••••"}
              </h1>
              {showBalance && available > 0 && (
                <span className="text-fluid-xxs text-green-400 font-medium">
                  +{((available / (available + pending)) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={toggleForm}
              className="px-4 py-2 bg-white text-dark font-normal rounded shadow-sm transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-fluid-xxs"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Withdraw Funds
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
        </div>

        {/* Pending Balance & Withdraw */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-fluid-xxs text-slate-400">Pending Balance</p>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="Once the piece is delivered, these funds will be ready for withdrawal."
              >
                <button className="p-1 rounded transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600">
                  <Info
                    size={16}
                    strokeWidth={1.5}
                    className="text-slate-500"
                  />
                </button>
              </Tooltip>
            </div>

            <h2 className="text-fluid-lg font-semibold">
              {showBalance ? formatPrice(pending, "USD") : "••••••"}
            </h2>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Total
            </p>
            <p className="text-fluid-xxs font-semibold mt-1">
              {showBalance ? formatPrice(available + pending, "USD") : "••••"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Available
            </p>
            <p className="text-fluid-xxs font-semibold mt-1 text-green-400">
              {showBalance
                ? `${(isNaN(available / (available + pending)) ? 0 : (available / (available + pending)) * 100).toFixed(0)}%`
                : "••"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Pending
            </p>
            <p className="text-fluid-xxs font-semibold mt-1 text-amber-400">
              {showBalance
                ? `${(isNaN(pending / (available + pending)) ? 0 : (available / (available + pending)) * 100).toFixed(0)}%`
                : "••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
