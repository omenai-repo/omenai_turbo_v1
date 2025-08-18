"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
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
  const { csrf } = useAuth({ requiredRole: "gallery" });
  async function generateLoginLink() {
    setGeneratingLoginLink(true);
    const loginLink = await generateStripeLoginLink(account, csrf || "");
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
    <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-md shadow-sm">
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Header */}
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
        </div>

        {/* Available Balance */}
        <div>
          <p className="text-fluid-xs font-medium text-gray-600 mb-2">
            Balance on Stripe
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {formatPrice(balance.pending[0].amount / 100, currency)}
          </h1>
        </div>

        {/* Pending Balance */}
        <div className="w-full p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-fluid-xs text-amber-800">
            Balance on stripe is automatically credited to your bank account.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-2">
          <button
            onClick={generateLoginLink}
            disabled={generatingLoginLink}
            className="w-full h-12 bg-gray-900 text-white text-fluid-xs font-semibold rounded-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-dark/90 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-3"
          >
            {generatingLoginLink ? <LoadSmall /> : "View Stripe Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
