"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

const paymentIcons = {
  apple_pay: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applepay.svg",
  google_pay:
    "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlepay.svg",
  amazon_pay:
    "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonpay.svg",
  paypal: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paypal.svg",
  cashapp: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cashapp.svg",
  link: "https://cdn.jsdelivr.net/npm/heroicons@2.1.1/24/outline/link.svg",
};

type PaymentIconType =
  | "apple_pay"
  | "google_pay"
  | "amazon_pay"
  | "paypal"
  | "link"
  | "cashapp";

export function PaymentMethodWallet({
  type,
}: {
  type: PaymentIconType | string;
}) {
  function formatLabel(value: string): string {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const { user } = useAuth({ requiredRole: "gallery" });
  return (
    <>
      <div className="flex justify-start">
        <div className="flex items-center gap-x-2 justify-between">
          <div>
            <p className="text-fluid-base font-semibold text-slate-300">
              {formatLabel(type)} Wallet
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 mb-12 flex flex-col space-y-2">
        <p className="text-xs text-slate-300">{user.email}</p>
        <p className="text-xs text-slate-300">{user.name}</p>
      </div>
    </>
  );
}
