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
    <div className="transition-all duration-500 ease-out animate-[fadeUp_0.6s] relative w-full max-w-md rounded bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-lg">
      {/* Subtle texture */}
      <div className="absolute inset-0 rounded opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

      <div className="relative flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">
              Payout balance
            </p>
            <h1 className="mt-1 text-3xl font-semibold">
              {formatPrice(balance.pending[0].amount / 100, currency)}
            </h1>
          </div>

          <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div className="rounded bg-white/5 p-4 text-sm text-white/80">
          Balance on Stripe is automatically transferred to your connected bank
          account.
        </div>

        {/* Action */}
        <button
          onClick={generateLoginLink}
          disabled={generatingLoginLink}
          className="inline-flex items-center justify-center rounded bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:opacity-60"
        >
          {generatingLoginLink ? <LoadSmall /> : "Open Stripe dashboard"}
        </button>
      </div>
    </div>
  );
}
