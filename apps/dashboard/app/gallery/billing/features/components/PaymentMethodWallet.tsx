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
  link: "https://cdn.brandfetch.io/link.co/logo.svg",
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
  const { user } = useAuth({ requiredRole: "gallery" });
  return (
    <>
      <div className="flex justify-start">
        <div className="flex items-center gap-x-2 justify-between">
          <img
            src={paymentIcons[type as PaymentIconType] ?? ""}
            alt={type}
            className="h-6 w-auto object-contain text-white  rounded"
          />
          <div>
            <p className="text-fluid-base font-semibold text-slate-300">
              {type === "apple_pay"
                ? "Apple Pay"
                : type === "amazon_pay"
                  ? "Amazon Pay"
                  : type === "cashapp"
                    ? "Cash App"
                    : type === "google_pay"
                      ? "Google Pay"
                      : "Wallet"}
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
