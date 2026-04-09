"use client";

import { WithdrawalAccount } from "@omenai/shared-types";
import Link from "next/link";
import React, { useState } from "react";

export default function PrimaryWithdrawalAccount({
  withdrawal_account,
}: {
  withdrawal_account: WithdrawalAccount | null;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  // Helper to format IBAN into readable chunks (e.g., DE89 3704 ...)
  const formatIBAN = (iban: string) => {
    if (!iban) return "";
    return iban.replace(/(.{4})/g, "$1 ").trim();
  };

  // Helper to mask IBAN (shows first 4 and last 4)
  const maskIBAN = (iban: string) => {
    if (!iban || iban.length < 8) return iban;
    const start = iban.slice(0, 4);
    const end = iban.slice(-4);
    return `${start} •••• •••• •••• ${end}`;
  };

  // Helper to mask standard account numbers (shows only last 4)
  const maskStandardAccount = (accNum: string) => {
    if (!accNum || accNum.length < 4) return accNum;
    return `•••• •••• ${accNum.slice(-4)}`;
  };

  // Dynamic variable resolution based on the region type
  const isEU = withdrawal_account?.type === "eu";
  const label = isEU ? "IBAN" : "Account Number";

  // Safely extract the correct identifier based on the discriminated union
  const rawIdentifier = isEU
    ? withdrawal_account.iban
    : withdrawal_account?.account_number || "";

  // Determine the display string based on region and reveal state
  const displayValue = isRevealed
    ? isEU
      ? formatIBAN(rawIdentifier)
      : rawIdentifier
    : isEU
      ? maskIBAN(rawIdentifier)
      : maskStandardAccount(rawIdentifier);

  // Determine fallback bank name if optional in UK/EU
  const displayBankName = withdrawal_account?.bank_name
    ? withdrawal_account.bank_name.toUpperCase()
    : isEU
      ? "EUROPEAN BANK"
      : "BANK";

  return (
    <>
      {withdrawal_account === null ? (
        // Empty State - No Account
        <div className="my-8">
          <div className="bg-slate-50 rounded border-2 border-dashed border-slate-300 p-8 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center mx-auto">
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
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  No Withdrawal Account
                </h3>
                <p className="text-fluid-xxs text-slate-600">
                  Add a primary account to withdraw your earnings
                </p>
              </div>

              {/* Action Button */}
              <Link
                href="/artist/app/wallet/add_primary_account"
                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-fluid-xxs font-light rounded shadow-sm transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Primary Account
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-6">
          <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                  </div>
                  <div>
                    <h3 className="text-fluid-xs font-semibold text-slate-900">
                      Primary Withdrawal Account
                    </h3>
                    <p className="text-fluid-xxs text-slate-600">
                      Active and verified
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="p-6 space-y-1">
              {/* Bank Name */}
              <div className="flex items-center justify-between py-2 group">
                <span className="text-fluid-xxs text-slate-600">Bank Name</span>
                <span className="text-fluid-xxs font-medium text-slate-900">
                  {displayBankName}
                </span>
              </div>

              <div className="border-b border-slate-100"></div>

              {/* Dynamic Account Number / IBAN */}
              <div className="flex items-center justify-between py-2 group">
                <span className="text-fluid-xxs text-slate-600">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-fluid-xxs font-medium text-slate-900 font-mono tracking-wider">
                    {displayValue}
                  </span>

                  {/* Reveal Toggle Button */}
                  <button
                    onClick={() => setIsRevealed(!isRevealed)}
                    className="p-1 rounded hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
                    title={isRevealed ? "Hide details" : "Reveal details"}
                  >
                    {isRevealed ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(String(rawIdentifier))
                    }
                    className="p-1 rounded hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
                    title={`Copy ${label}`}
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-100"></div>

              {/* Account Name */}
              <div className="flex items-center justify-between py-2">
                <span className="text-fluid-xxs text-slate-600">
                  Account Name
                </span>
                <span className="text-fluid-xxs font-medium text-slate-900">
                  {withdrawal_account.account_name}
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <Link
                  href="/artist/app/wallet/add_primary_account"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-fluid-xxs rounded shadow-sm transition-all transform active:scale-95 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Change Primary Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
