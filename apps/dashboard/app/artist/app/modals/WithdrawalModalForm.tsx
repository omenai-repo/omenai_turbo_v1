"use client";
import { Loader, Paper, PinInput } from "@mantine/core";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";
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
export default function WithdrawalModalForm() {
  const [amount_data, set_amount_data] = useState<{
    amount: number;
    currency_amount: number;
    rate: number | null;
  }>({ amount: 0, currency_amount: 0, rate: 0 });

  const { toggleWithdrawalFormPopup } = artistActionStore();
  const queryClient = useQueryClient();
  const session = useSession() as ArtistSchemaTypes;
  const [wallet_pin, set_wallet_pin] = useState("");
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
        session.base_currency,
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
      setWithdrawalLoading(true);
      const withdrawal_response = await createTransfer({
        amount: amount_data.amount,
        wallet_id: session.wallet_id as string,
        wallet_pin,
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
    <>
      {isWithdrawalSuccessful ? (
        <WithdrawalSuccessScreen />
      ) : (
        <div className="flex flex-col space-y-4 max-w-lg w-full">
          <div className="flex flex-col space-y-5">
            <p className=" font-medium">Enter withdrawal amount</p>
            <Paper
              radius="lg"
              withBorder
              className="p-5 flex flex-col space-y-2"
            >
              <p className="text-xs font-medium">You Send ($)</p>
              <input
                className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-700/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-xs font-medium h-[35px] p-5 rounded-lg w-full placeholder:text-xs placeholder:text-gray-700/40 "
                placeholder="0.0"
                onChange={handleAmountChange}
              />
            </Paper>

            <div className="flex justify-center w-full my-2">
              <div className="flex flex-col space-y-1 items-center">
                <button
                  disabled={transferRateLoading || amount_data.amount === 0}
                  onClick={handleAmountConvert}
                  className=" p-3 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-xs font-normal"
                >
                  {transferRateLoading ? (
                    <Loader color="rgba(255, 255, 255, 1)" size="sm" />
                  ) : (
                    <RefreshCcwDot
                      size={20}
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                  )}
                </button>
                <span className="text-[11px] font-medium">
                  Click to convert
                </span>{" "}
              </div>
            </div>

            <Paper
              radius="lg"
              withBorder
              className="p-5 flex flex-col space-y-2"
            >
              <p className="text-xs font-medium">
                You Get ({session.base_currency})
              </p>
              <Paper className="p-5" radius="lg" withBorder>
                <span className="text-[14px] font-medium">
                  {formatPrice(
                    amount_data.currency_amount,
                    session.base_currency
                  )}
                </span>
              </Paper>
            </Paper>

            <Paper
              radius="lg"
              withBorder
              className="p-5 flex flex-col space-y-2"
            >
              <p className="text-xs font-medium">Enter wallet pin</p>
              <div className="flex flex-col space-y-4">
                <div className="w-full flex justify-center">
                  <PinInput
                    size="md"
                    mask
                    placeholder="*"
                    onChange={set_wallet_pin}
                    type="number"
                  />
                </div>
                <Link
                  onClick={() => toggleWithdrawalFormPopup(false)}
                  href="/artist/app/wallet/pin_recovery"
                  className="text-red-600 font-medium text-xs text-center my-5"
                >
                  Forgot pin?
                </Link>
              </div>
            </Paper>
          </div>

          <div className="w-full flex justify-center">
            <button
              onClick={handleWithdrawal}
              disabled={withdrawalLoading || amount_data.amount === 0}
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
            >
              {withdrawalLoading ? (
                <Loader color="rgba(255, 255, 255, 1)" size="sm" />
              ) : (
                "Send money"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
