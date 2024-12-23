"use client";
import { generateStripeLoginLink } from "@omenai/shared-services/stripe/generateStripeLoginLink";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function BalanceBox({
  account,
  balance,
}: {
  account: string;
  balance: any;
}) {
  const [generatingLoginLink, setGeneratingLoginLink] = useState(false);

  const router = useRouter();
  async function generateLoginLink() {
    setGeneratingLoginLink(true);
    const loginLink = await generateStripeLoginLink(account);
    if (!loginLink?.isOk) {
      toast.error("Error notification", {
        description: "Something went wrong, Please try again.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setGeneratingLoginLink(true);
    } else router.replace(loginLink.url);
  }
  const currency = getCurrencySymbol(balance.available[0].currency);

  return (
    <div className="bg-[#FAFAFA] border border-[#E0E0E0] p-6 w-[500px] rounded-lg">
      <div className="flex flex-col items-center my-4 space-y-4 text-dark">
        <p className="text-[14px]">Stripe Available Balance</p>

        <h1 className="text-md font-bold">
          {formatPrice(balance.available[0].amount / 100, currency)}
        </h1>

        <p className="text-[14px]">
          Balance pending on Stripe:{" "}
          <span className="font-bold text-base">
            {formatPrice(balance.pending[0].amount / 100, currency)}
          </span>
        </p>

        <div className="mt-16 w-full flex space-x-2">
          <button
            disabled={balance.available[0].amount / 100 === 0}
            className="h-[40px] text-xs font-normal disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] px-4 w-full bg-dark text-white cursor-pointer grid place-items-center"
          >
            Payout Balance
          </button>
          <button
            onClick={generateLoginLink}
            disabled={generatingLoginLink}
            className="h-[40px] text-xs font-normal disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] px-4 w-full bg-dark text-white cursor-pointer grid place-items-center"
          >
            {generatingLoginLink ? <LoadSmall /> : "View Stripe Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
