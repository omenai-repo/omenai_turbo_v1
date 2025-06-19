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
    <div className="bg-gradient-to-r from-dark to-dark/80 text-white p-8 rounded-[10px] space-y-6">
      <div className="flex justify-between items-center">
        <h4>Wallet balance</h4>
        <CurrencyDropdown />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-x-3">
            <p className="text-fluid-xs">Available balance</p>
            {showBalance ? (
              <Eye
                onClick={() => setShowBalance(!showBalance)}
                size={24}
                strokeWidth={1.5}
                absoluteStrokeWidth
                className="cursor-pointer"
              />
            ) : (
              <EyeOff
                onClick={() => setShowBalance(!showBalance)}
                size={24}
                strokeWidth={1.5}
                absoluteStrokeWidth
                className="cursor-pointer"
              />
            )}
          </div>

          <h1 className="text-fluid-lg font-normal">
            {showBalance ? formatPrice(available, "USD") : "********"}
          </h1>
        </div>
        <Divider my="lg" variant="dashed" />
        <div className="flex justify-between items-center space-y-1">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-x-3">
              <p className="text-fluid-xxs">Pending balance</p>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="Once the piece is delivered, these funds will be ready for withdrawal."
              >
                <Info
                  className="cursor-pointer"
                  size={20}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              </Tooltip>
            </div>

            <h1 className="text-fluid-sm font-normal">
              {" "}
              {showBalance ? formatPrice(pending, "USD") : "********"}
            </h1>
          </div>
          <div>
            <button
              onClick={toggleForm}
              className="h-[35px] p-5 rounded-full w-full flex items-center border-0 ring-1 ring-[#fafafa] hover:bg-[#fafafa] hover:text-dark duration-200 justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
            >
              Withdraw funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
