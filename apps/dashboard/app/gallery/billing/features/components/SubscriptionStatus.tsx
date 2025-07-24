"use client";

import { galleryModalStore } from "@omenai/shared-state-store/src/gallery/gallery_modals/GalleryModals";
import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import Link from "next/link";
import { daysLeft } from "@omenai/shared-utils/src/daysLeft";

export default function SubDetail({
  sub_data,
}: {
  sub_data: SubscriptionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  };
}) {
  const { updateOpenModal } = galleryModalStore();

  const currency_symbol = getCurrencySymbol(sub_data.plan_details.currency);
  return (
    <div className=" bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fluid-xs font-semibold text-slate-900">
          Your Subscription
        </h3>
        <div
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            sub_data.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {sub_data.status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        {/* Timeline Progress */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image
                src="/omenai_logo_cut.png"
                width={20}
                height={20}
                alt="Omenai"
              />
              <span className="font-medium text-slate-900">
                {sub_data.plan_details.type} Plan
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(
                sub_data.plan_details.interval === "monthly"
                  ? +sub_data.plan_details.value.monthly_price
                  : +sub_data.plan_details.value.annual_price,
                currency_symbol
              )}
            </span>
          </div>

          {sub_data.status === "active" && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Period progress</span>
                <span>{daysLeft(sub_data.expiry_date)} days left</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-dark h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.max(5, 100 - (daysLeft(sub_data.expiry_date) / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg
            className="w-4 h-4"
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
          <span>Next billing: {formatIntlDateTime(sub_data.expiry_date)}</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          {sub_data.status === "canceled" || sub_data.status === "expired" ? (
            <Link
              href="/gallery/billing/plans?plan_action=reactivation"
              className="w-full"
            >
              <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all hover:bg-blue-700">
                Reactivate
              </button>
            </Link>
          ) : (
            <>
              <Link href="/gallery/billing/plans" className="flex-1">
                <button className="w-full px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-all hover:bg-slate-200">
                  Manage
                </button>
              </Link>
              <button
                onClick={() => updateOpenModal()}
                className="px-3 py-2 text-red-600 text-sm font-medium rounded-lg transition-all hover:bg-red-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
