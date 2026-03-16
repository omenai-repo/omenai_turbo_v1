import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

interface PriceRevealCardProps {
  usd_price: number;
  price: number;
  currency: string;
}

export default function PriceRevealCard({
  usd_price,
  price,
  currency,
}: PriceRevealCardProps) {
  return (
    <div className="bg-white p-8 sm:p-12 text-center relative flex flex-col items-center justify-center">
      <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
        Proposed listing price
      </p>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tighter mb-2">
        {formatPrice(usd_price, "USD")}
      </h1>

      <div className="mt-2 inline-flex items-center gap-2 bg-neutral-50 px-4 py-1.5 rounded -full border border-neutral-100">
        <span className="text-neutral-400 text-xs">
          Local Currency equivalent ({currency.toUpperCase()}):
        </span>
        <span className="text-dark text-sm font-semibold">
          {formatPrice(price, currency)}
        </span>
      </div>
      <div className="mt-6 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
        This price is calculated based on your artist categorization, the
        medium, and dimensions of the artwork. Consistent pricing helps build
        collector trust.
      </div>
    </div>
  );
}
