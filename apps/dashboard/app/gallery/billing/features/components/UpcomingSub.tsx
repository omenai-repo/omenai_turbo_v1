import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <div className="w-full">
      {/* Design 1: Clean Status-Based Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[250px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-fluid-xs font-semibold text-slate-900 flex items-center gap-2">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upcoming Billing
            </h3>
            {sub_data.status === "active" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {sub_data.status === "canceled" || sub_data.status === "expired" ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-red-600 capitalize">
                  Subscription {sub_data.status}
                </p>
              </div>
              <Link href="/gallery/billing/plans?plan_action=reactivation">
                <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm transition-all transform active:scale-95 hover:bg-slate-800">
                  Reactivate Subscription
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan Details */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Image
                      src="/omenai_logo_cut.png"
                      width={24}
                      height={24}
                      alt="Omenai"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Omenai {sub_data.next_charge_params.type}
                    </h4>
                    <p className="text-sm text-slate-600 capitalize">
                      {sub_data.next_charge_params.interval} billing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-fluid-md font-bold text-slate-900">
                    {formatPrice(
                      sub_data.next_charge_params.value,
                      currency_symbol
                    )}
                  </p>
                </div>
              </div>

              {/* Billing Period */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-900">
                      <span className="font-medium">Next billing:</span>{" "}
                      {formatIntlDateTime(sub_data.expiry_date)}
                    </p>
                    <p className="text-blue-700">
                      <span className="font-medium">Period ends:</span>{" "}
                      {getFutureDate(
                        sub_data.expiry_date,
                        sub_data.next_charge_params.interval
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
