"use client";

import { galleryModalStore } from "@omenai/shared-state-store/src/gallery/gallery_modals/GalleryModals";
import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
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

  function calculateUploadUsagePercentage(
    uploadCount: number,
    uploadLimit: number
  ): number {
    if (uploadLimit === Number.MAX_SAFE_INTEGER) return 0;
    const percentageUsed = (uploadCount / uploadLimit) * 100;
    return uploadCount > 0 ? Math.max(5, Math.min(100, percentageUsed)) : 0;
  }

  function getProgressBarColor(
    uploadCount: number,
    uploadLimit: number
  ): string {
    if (uploadLimit === Number.MAX_SAFE_INTEGER) return "bg-emerald-500";
    const percentageUsed = (uploadCount / uploadLimit) * 100;
    if (percentageUsed >= 90) return "bg-rose-500";
    if (percentageUsed >= 70) return "bg-amber-500";
    return "bg-slate-900";
  }

  const usagePercentage = calculateUploadUsagePercentage(
    sub_data.upload_tracker.upload_count,
    sub_data.upload_tracker.limit
  );

  const progressBarColor = getProgressBarColor(
    sub_data.upload_tracker.upload_count,
    sub_data.upload_tracker.limit
  );

  const currency_symbol = getCurrencySymbol(sub_data.plan_details.currency);
  const daysRemaining = daysLeft(sub_data.expiry_date);
  const isUnlimited = sub_data.upload_tracker.limit === Number.MAX_SAFE_INTEGER;

  return (
    <div className="h-full bg-slate-900 rounded-3xl p-8 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-green-500/20 rounded-full blur-2xl" />

      {/* Top Section: Header & Price */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center p-1 bg-white/10 rounded-md backdrop-blur-sm">
                <Image
                  src="/omenai_logo_cut.png"
                  width={14}
                  height={14}
                  alt="Omenai"
                  className="invert brightness-0"
                />
              </span>
              <span className="text-sm font-medium text-green-400 tracking-wide">
                Current Plan
              </span>
            </div>
            <h2 className="text-fluid-md font-bold tracking-tight">
              OMENAI {sub_data.plan_details.type} Plan
            </h2>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold">
              {formatPrice(
                sub_data.plan_details.interval === "monthly"
                  ? +sub_data.plan_details.value.monthly_price
                  : +sub_data.plan_details.value.annual_price,
                currency_symbol
              )}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              / {sub_data.plan_details.interval}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
          <div
            className={`w-2 h-2 rounded-full ${sub_data.status === "active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-red-400"}`}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            {sub_data.status}
          </span>
        </div>
      </div>

      {/* Middle: Usage Stats */}
      <div className="relative z-10 space-y-6 mt-6">
        {/* Uploads Tracker */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Upload Capacity Usage</span>
            <span>
              {isUnlimited
                ? "Unlimited"
                : `${sub_data.upload_tracker.upload_count} / ${sub_data.upload_tracker.limit}`}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isUnlimited ? "bg-emerald-400 w-full" : progressBarColor}`}
              style={{ width: isUnlimited ? "100%" : `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Days Tracker */}
        {(sub_data.status === "active" || sub_data.status === "canceled") && (
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
              <span>Billing Cycle</span>
              <span>{daysRemaining} days left</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-green-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, 100 - (daysRemaining / 30) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Actions */}
      <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex gap-3">
        {sub_data.status === "active" ? (
          <>
            <Link href="/gallery/billing/plans" className="flex-1">
              <button className="w-full py-2.5 px-4 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">
                Manage Plan
              </button>
            </Link>
            <button
              onClick={() => updateOpenModal()}
              className="py-2.5 px-4 bg-white/5 text-red-600 border border-white/10 text-xs font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel Subscription
            </button>
          </>
        ) : (
          <Link
            href="/gallery/billing/plans?plan_action=reactivation"
            className="w-full"
          >
            <button className="w-full py-2.5 px-4 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25">
              Reactivate Subscription
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
