import { PaymentMethod } from "@stripe/stripe-js"; // if you’re using stripe-js types
import { PaymentMethodBank } from "./PaymentMethodbank";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { PaymentMethodWallet } from "./PaymentMethodWallet";
import Link from "next/link";

export default function BillingCard({
  paymentMethod,
  plan_id,
  plan_interval,
}: {
  paymentMethod: PaymentMethod;
  plan_id: string;
  plan_interval: string;
}) {
  return (
    <div className="bg-white rounded-2xl h-full border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="relative bg-slate-100/70 backdrop-blur px-6 py-4 border-b border-slate-200 rounded-t-2xl">
        {/* subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_top_left,theme(colors.slate.400),transparent_70%)]" />

        <h3 className="relative z-10 text-fluid-xxs font-semibold text-slate-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Billing Method
        </h3>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {paymentMethod.type === "card" && paymentMethod.card && (
          <PaymentMethodCard card={paymentMethod.card} />
        )}

        {paymentMethod.type !== "card" &&
          paymentMethod.type !== "us_bank_account" && (
            <PaymentMethodWallet type={paymentMethod.type} />
          )}

        {paymentMethod.type === "us_bank_account" &&
          paymentMethod.us_bank_account && (
            <PaymentMethodBank bank={paymentMethod.us_bank_account} />
          )}

        {/* Button */}
        <Link
          href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan_id}&interval=${plan_interval}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-fluid-xxs font-medium rounded-full shadow-sm 
                 transition-all duration-200 active:scale-95 hover:bg-slate-800 
                 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Update Payment Method
        </Link>
      </div>
    </div>
  );
}
