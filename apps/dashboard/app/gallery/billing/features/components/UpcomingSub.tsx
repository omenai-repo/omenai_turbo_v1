import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { getFutureDate } from "@omenai/shared-utils/src/getFutureDate";

export default function UpcomingSub({
  sub_data,
}: {
  sub_data: SubscriptionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  };
}) {
  const currency_symbol = getCurrencySymbol(
    sub_data.next_charge_params.currency
  );
  const isActive = sub_data.status === "active";

  return (
    <div className="h-full bg-white rounded border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col">
      <h3 className="text-fluid-xs font-medium text-slate-500 uppercase tracking-wider mb-6">
        Upcoming Invoice
      </h3>

      {isActive ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-fluid-xl font-bold text-slate-900 tracking-tight">
              {formatPrice(sub_data.next_charge_params.value, currency_symbol)}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Due on{" "}
            <span className="text-slate-900">
              {formatIntlDateTime(sub_data.expiry_date)}
            </span>
          </p>

          <div className="p-4 bg-slate-50 rounded border border-slate-100 flex gap-4 items-center">
            <div className="p-2 bg-white rounded border border-slate-100 shadow-sm text-slate-600">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-col flex">
              <span className="text-xs text-slate-500">
                Billing Period Ends
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {getFutureDate(
                  sub_data.expiry_date,
                  sub_data.next_charge_params.interval
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
          <span className="text-slate-400 font-medium text-sm">
            No upcoming charges
          </span>
          <span className="text-xs text-slate-300">
            Subscription is {sub_data.status}
          </span>
        </div>
      )}
    </div>
  );
}
