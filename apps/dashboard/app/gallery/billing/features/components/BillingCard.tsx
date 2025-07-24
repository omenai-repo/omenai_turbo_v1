import Image from "next/image";
import Link from "next/link";

export default function BillingCard({
  expiry,
  first_6digits,
  last_4digits,
  type,
  plan_id,
  plan_interval,
}: {
  expiry: string;
  first_6digits: string;
  last_4digits: string;
  type: string;
  plan_id: string;
  plan_interval: string;
}) {
  return (
    <div className=" bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
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
          Billing Card Details
        </h3>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Card Number
              </p>
              <p className="text-lg font-semibold text-slate-900 font-mono">
                {first_6digits} •• •••• {last_4digits}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Expires
              </p>
              <p className="text-base font-medium text-slate-700">{expiry}</p>
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg">
            <Image
              src={`/icons/${type.toLowerCase()}.png`}
              alt={`${type} card`}
              height={32}
              width={48}
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <Link
          href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan_id}&interval=${plan_interval}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark text-white text-fluid-xs font-medium rounded-lg shadow-sm transition-all transform active:scale-95 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Update Payment Method
        </Link>
      </div>
    </div>
  );
}
