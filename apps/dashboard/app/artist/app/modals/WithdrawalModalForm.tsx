"use client";
import { Loader, Paper, PinInput } from "@mantine/core";
import { RefreshCcwDot } from "lucide-react";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import { getTransferRate } from "@omenai/shared-services/wallet/getTransferRate";
import { createTransfer } from "@omenai/shared-services/wallet/createTransfer";
import { toast } from "sonner";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import WithdrawalSuccessScreen from "./WithdrawalSuccessScreen";
import { useQueryClient } from "@tanstack/react-query";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function WithdrawalModalForm() {
  const [amount_data, set_amount_data] = useState<{
    amount: number;
    currency_amount: number;
    rate: number | null;
  }>({ amount: 0, currency_amount: 0, rate: 0 });

  const { toggleWithdrawalFormPopup } = artistActionStore();
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const [wallet_pin, set_wallet_pin] = useState("");
  const [wallet_pin_error, set_wallet_pin_error] = useState<boolean>(false);

  const handlePinChange = (value: string) => {
    set_wallet_pin(value);
    if (value.length < 4) {
      set_wallet_pin_error(true);
    } else {
      set_wallet_pin_error(false);
    }
  };
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    set_amount_data({ currency_amount: 0, amount: Number(value), rate: null });
  };

  const [transferRateLoading, setTransferRateLoading] =
    useState<boolean>(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);
  const [isWithdrawalSuccessful, setIsWithdrawalSuccessful] =
    useState<boolean>(false);
  const handleAmountConvert = async () => {
    try {
      setTransferRateLoading(true);
      const rate_response = await getTransferRate(
        user.base_currency,
        "USD",
        amount_data.amount
      );

      if (rate_response === undefined || !rate_response.isOk) {
        toast.error("Error Notification", {
          description:
            rate_response?.message ||
            "Something went wrong. Please try again or contact support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });

        return;
      }
      console.log(rate_response);

      set_amount_data((prev) => {
        return {
          ...prev,
          currency_amount: rate_response.data.source.amount,
          rate: rate_response.data.rate,
        };
      });
    } catch (error) {
      toast.error("Error Notification", {
        description:
          "Something went wrong. It's probably from us, please contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setTransferRateLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    try {
      if (wallet_pin.length < 4) {
        toast.error("Error Notification", {
          description: "Please enter a valid wallet pin",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      setWithdrawalLoading(true);
      const withdrawal_response = await createTransfer({
        amount: amount_data.amount,
        wallet_id: user.wallet_id as string,
        wallet_pin,
        token: csrf || "",
      });

      if (withdrawal_response === undefined || !withdrawal_response.isOk) {
        toast.error("Error Notification", {
          description:
            withdrawal_response?.message ||
            "Something went wrong. Please try again or contact support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });

        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });
      setIsWithdrawalSuccessful(withdrawal_response.isOk);
    } catch (error) {
      toast.error("Error Notification", {
        description:
          "Something went wrong. It's probably from us, please contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setWithdrawalLoading(false);
    }
  };
  return (
    // Beautiful Withdrawal Form Component
    <>
      {isWithdrawalSuccessful ? (
        <WithdrawalSuccessScreen />
      ) : (
        <div className="max-w-lg w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-dark text-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <div>
                  <h2 className="text-fluid-sm font-semibold">
                    Withdraw Funds
                  </h2>
                  <p className="text-fluid-xs text-slate-300 mt-0.5">
                    Transfer to your bank account
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Amount Input Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Withdrawal Amount
                </label>

                {/* Send Amount */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">You Send</span>
                      <span className="text-sm font-medium text-slate-700">
                        USD
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        onChange={handleAmountChange}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-lg font-semibold text-dark placeholder:text-slate-400 focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
                <div className="flex justify-center py-2">
                  <button
                    disabled={transferRateLoading || amount_data.amount === 0}
                    onClick={handleAmountConvert}
                    className="group relative p-4 bg-slate-100 rounded-full transition-all transform active:scale-95 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 grid place-items-center"
                    aria-label="Convert currency"
                  >
                    {transferRateLoading ? (
                      <Loader color="rgba(71, 85, 105, 1)" size="sm" />
                    ) : (
                      <RefreshCcwDot
                        size={20}
                        strokeWidth={1.5}
                        className="text-slate-600 transition-transform group-hover:rotate-180 duration-500"
                      />
                    )}
                  </button>
                </div>

                {/* Receive Amount */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">
                        You Receive
                      </span>
                      <span className="text-sm font-medium text-green-800">
                        {user.base_currency}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-3 border border-green-300">
                      <p className="text-lg font-bold text-green-800">
                        {formatPrice(
                          amount_data.currency_amount,
                          user.base_currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PIN Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Security PIN
                </label>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="space-y-4">
                    <p className="text-center text-sm text-slate-600 mb-4">
                      Enter your 4-digit wallet PIN
                    </p>
                    <div className="flex justify-center">
                      <PinInput
                        size="lg"
                        mask
                        placeholder="○"
                        onChange={(e) => handlePinChange(e)}
                        type="number"
                        error={wallet_pin_error}
                        styles={{
                          input: {
                            borderColor: wallet_pin_error
                              ? "#ef4444"
                              : "#e2e8f0",
                            backgroundColor: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            "&:focus": {
                              borderColor: "#1e293b",
                              boxShadow: "0 0 0 2px rgba(30, 41, 59, 0.1)",
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="text-center mt-4">
                      <Link
                        onClick={() => toggleWithdrawalFormPopup(false)}
                        href="/artist/app/wallet/pin_recovery"
                        className="text-sm text-slate-600 hover:text-dark transition-colors"
                      >
                        Forgot your PIN?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exchange Rate Info */}
              {amount_data.amount > 0 && amount_data.currency_amount > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs text-blue-700">
                      Exchange rate: 1 USD ={" "}
                      {(
                        amount_data.currency_amount / amount_data.amount
                      ).toFixed(2)}{" "}
                      {user.base_currency}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleWithdrawal}
                disabled={withdrawalLoading || amount_data.amount === 0}
                className="w-full py-3 bg-dark text-white font-medium rounded-xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 text-fluid-xs"
              >
                {withdrawalLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader color="rgba(255, 255, 255, 1)" size="sm" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
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
                    Confirm Withdrawal
                  </span>
                )}
              </button>

              {/* Security Notice */}
              <div className="text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secured transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
