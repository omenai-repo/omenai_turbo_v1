import { PaymentMethod } from "@stripe/stripe-js";
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
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium tracking-wide">Payment Method</h3>
        <span className="text-xs text-white bg-green-600 px-3 py-1 rounded-full">
          Secure
        </span>
      </div>

      <div className="space-y-4">
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
      </div>

      <Link
        href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan_id}&interval=${plan_interval}`}
        className="mt-6 underline inline-flex items-center text-xs font-medium text-white/80 hover:text-white"
      >
        Update payment method
      </Link>
    </div>
  );
}
