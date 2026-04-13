"use client";
import { Loader, PinInput } from "@mantine/core";
import {
  AlertCircle,
  RefreshCcwDot,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import { getTransferRate } from "@omenai/shared-services/wallet/getTransferRate";
import { createTransfer } from "@omenai/shared-services/wallet/createTransfer";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import WithdrawalSuccessScreen from "./WithdrawalSuccessScreen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { fetchUser } from "@omenai/shared-services/auth/session/fetchUser";

// --- Skeleton Loader Component ---
const FormSkeleton = () => (
  <div className="max-w-md w-full max-h-[95vh] rounded-xl overflow-hidden m-auto bg-white shadow-2xl border border-slate-100 animate-pulse">
    <div className="bg-slate-900 px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-700/50 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-5 w-32 bg-slate-700/50 rounded"></div>
        <div className="h-3 w-48 bg-slate-700/50 rounded"></div>
      </div>
    </div>
    <div className="p-6 space-y-5">
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
        <div className="h-20 w-full bg-slate-100 rounded-lg border border-slate-200"></div>
      </div>
      <div className="flex justify-center -my-2 relative z-10">
        <div className="h-10 w-10 bg-slate-200 rounded-full border-4 border-white"></div>
      </div>
      <div className="space-y-3">
        <div className="h-20 w-full bg-slate-100 rounded-lg border border-slate-200"></div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
        <div className="h-24 w-full bg-slate-100 rounded-lg border border-slate-200"></div>
      </div>
      <div className="h-12 w-full bg-slate-800 rounded-lg mt-6"></div>
    </div>
  </div>
);

export default function WithdrawalModalForm() {
  // 1. ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const [amount_data, set_amount_data] = useState<{
    amount: number;
    currency_amount: number;
    rate: number | null;
  }>({ amount: 0, currency_amount: 0, rate: 0 });

  const { toggleWithdrawalFormPopup } = artistActionStore();
  const queryClient = useQueryClient();
  const { user: artist, csrf } = useAuth({ requiredRole: "artist" });
  const [wallet_pin, set_wallet_pin] = useState("");
  const [wallet_pin_error, set_wallet_pin_error] = useState<boolean>(false);
  const rollbar = useRollbar();

  const [transferRateLoading, setTransferRateLoading] =
    useState<boolean>(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);
  const [isWithdrawalSuccessful, setIsWithdrawalSuccessful] =
    useState<boolean>(false);

  // 2. RUN QUERY
  const { data: fetchedData, isLoading: isFetchingUser } = useQuery({
    queryKey: ["artist_profile", artist?.artist_id],
    queryFn: async () => {
      const response = await fetchUser({
        id: artist.artist_id,
        route: "artist",
        token: csrf || "",
      });

      if (!response.isOk) throw new Error("Failed to fetch user data");

      return response.artist;
    },
    enabled: !!artist?.artist_id,
    refetchOnWindowFocus: false,
  });

  // 3. HANDLE EARLY RETURN AFTER HOOKS
  if (isFetchingUser) {
    return <FormSkeleton />;
  }

  // 4. DERIVED STATE
  const user = fetchedData?.base_currency ? fetchedData : artist;

  // 5. HANDLERS
  const handlePinChange = (value: string) => {
    set_wallet_pin(value);
    set_wallet_pin_error(value.length < 4);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    set_amount_data({ currency_amount: 0, amount: Number(value), rate: null });
  };

  const handleAmountConvert = async () => {
    try {
      setTransferRateLoading(true);
      const rate_response = await getTransferRate(
        user.base_currency,
        "USD",
        amount_data.amount,
      );

      if (rate_response === undefined || !rate_response.isOk) {
        toast_notif(
          "Something went wrong while fetching the transfer rate. Please try again later.",
          "error",
        );
        return;
      }

      set_amount_data((prev) => ({
        ...prev,
        currency_amount: rate_response.data.source.amount,
        rate: rate_response.data.rate,
      }));
    } catch (error) {
      rollbar.error(error instanceof Error ? error : new Error(String(error)));
      toast_notif(
        "Something went wrong while fetching the transfer rate. Please try again later.",
        "error",
      );
    } finally {
      setTransferRateLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    try {
      if (wallet_pin.length < 4) {
        toast_notif("Please enter a valid 4-digit wallet PIN", "error");
        return;
      }
      setWithdrawalLoading(true);
      const withdrawal_response = await createTransfer({
        amount: amount_data.amount,
        wallet_id: artist.wallet_id as string,
        wallet_pin,
        token: csrf || "",
      });

      if (withdrawal_response === undefined || !withdrawal_response.isOk) {
        toast_notif(
          withdrawal_response.message ||
            "Something went wrong while processing your withdrawal. Please try again later.",
          "error",
        );
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });
      setIsWithdrawalSuccessful(withdrawal_response.isOk);
    } catch (error) {
      rollbar.error(error instanceof Error ? error : new Error(String(error)));
      toast_notif(
        "Something went wrong while processing your withdrawal. Please try again later.",
        "error",
      );
    } finally {
      setWithdrawalLoading(false);
    }
  };

  return (
    <>
      {isWithdrawalSuccessful ? (
        <WithdrawalSuccessScreen />
      ) : (
        <div className="max-w-md w-full max-h-[95vh] rounded-xl overflow-y-auto m-auto shadow-2xl bg-white border border-slate-100">
          <div className="flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-5 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                  <Wallet className="w-6 h-6 text-slate-100" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Withdraw Funds
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Transfer to your bank account
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Conversion Section */}
              <div className="space-y-0 relative">
                {/* Send Amount */}
                <div className="bg-slate-50/80 rounded-t-xl p-4 border border-slate-200 border-b-0 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Withdrawal Amount
                    </label>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/50 px-2 py-1 rounded">
                      USD
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">
                      $
                    </span>
                    <input
                      name="amount"
                      type="number"
                      placeholder="0.00"
                      onChange={handleAmountChange}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-lg font-semibold text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Convert Button Connector */}
                <div className="mt-4 py-4 flex items-center justify-center relative">
                  <button
                    disabled={transferRateLoading || amount_data.amount === 0}
                    onClick={handleAmountConvert}
                    className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 group"
                    aria-label="Convert currency"
                  >
                    {transferRateLoading ? (
                      <Loader color="#0f172a" size={18} />
                    ) : (
                      <ArrowRightLeft
                        size={18}
                        strokeWidth={2}
                        className="transition-transform group-hover:rotate-180 duration-500"
                      />
                    )}
                  </button>
                </div>

                {/* Receive Amount */}
                <div className="bg-emerald-50/50 rounded-b-xl p-4 border border-emerald-100 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-800">
                      You Receive
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      {user.base_currency}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-emerald-200 shadow-sm flex items-center">
                    <p className="text-lg font-semibold text-emerald-900">
                      {amount_data.currency_amount > 0
                        ? formatPrice(
                            amount_data.currency_amount,
                            user.base_currency,
                          )
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exchange Rate Info */}
              {amount_data.amount > 0 && amount_data.currency_amount > 0 && (
                <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-100 flex items-center gap-2.5">
                  <RefreshCcwDot className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">
                    Rate: 1 USD ={" "}
                    {(amount_data.currency_amount / amount_data.amount).toFixed(
                      2,
                    )}{" "}
                    {user.base_currency}
                  </p>
                </div>
              )}

              <hr className="border-slate-100" />

              {/* PIN Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Security PIN
                </label>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    Enter your 4-digit wallet PIN to authorize
                  </p>
                  <div className="flex justify-center">
                    <PinInput
                      size="md"
                      name="pin"
                      mask
                      placeholder="○"
                      onChange={handlePinChange}
                      type="number"
                      error={wallet_pin_error}
                      styles={{
                        input: {
                          borderColor: wallet_pin_error ? "#ef4444" : "#cbd5e1",
                          backgroundColor: "#ffffff",
                          fontSize: "18px",
                          fontWeight: "600",
                          borderRadius: "8px",
                          "&:focus": {
                            borderColor: "#0f172a",
                          },
                        },
                      }}
                    />
                  </div>
                  <Link
                    onClick={() => toggleWithdrawalFormPopup(false)}
                    href="/artist/app/wallet/pin_recovery"
                    className="inline-block mt-4 text-xs font-medium text-slate-500 hover:text-slate-900 underline transition-colors"
                  >
                    Forgot your PIN?
                  </Link>
                </div>
              </div>

              {/* Settlement Tip */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Once successfully initiated, settlement times vary based on
                  your financial institution's processing hours.
                </p>
              </div>

              {/* Submit Action */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={handleWithdrawal}
                  disabled={withdrawalLoading || amount_data.amount === 0}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  {withdrawalLoading ? (
                    <>
                      <Loader color="rgba(255, 255, 255, 0.8)" size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Withdrawal</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secured & Encrypted Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
