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
    <div className="bg-white rounded shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-fluid-xxs font-semibold text-slate-900 flex items-center gap-2">
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

      <div className="p-6">
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

        {/* Add more types here as you support them */}

        <Link
          href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan_id}&interval=${plan_interval}`}
          className="w-fit gap-2 px-4 py-2 bg-dark text-white text-fluid-xxs font-medium rounded shadow-sm transition-all transform active:scale-95 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Update Payment Method
        </Link>
      </div>
    </div>
  );
}
