import type { PaymentMethod } from "@stripe/stripe-js";

export function PaymentMethodCard({ card }: { card: PaymentMethod.Card }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Card Number
          </p>
          <p className="text-lg font-semibold text-white font-mono">
            {card.brand.toUpperCase()} •••• {card.last4}
          </p>
        </div>

        <div>
          <p className="text-xs text-white uppercase tracking-wide mb-1">
            Expires
          </p>
          <p className="text-base font-medium text-white">
            {card.exp_month}/{card.exp_year}
          </p>
        </div>
      </div>

      <div className="bg-slate-100 p-3 rounded">
        <img
          src={`/icons/${card.brand}.png`}
          alt={`${card.brand} card`}
          className="h-5 w-auto object-contain"
        />
      </div>
    </div>
  );
}
