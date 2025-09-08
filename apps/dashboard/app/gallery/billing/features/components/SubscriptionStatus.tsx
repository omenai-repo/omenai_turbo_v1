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

  function calculateUploadUsagePercentage(
    uploadCount: number,
    uploadLimit: number
  ): number {
    // Handle unlimited plans (MAX_SAFE_INTEGER)
    if (uploadLimit === Number.MAX_SAFE_INTEGER) {
      return 0; // Always show empty for unlimited plans
    }

    // Calculate percentage used
    const percentageUsed = (uploadCount / uploadLimit) * 100;

    // Ensure minimum 5% visibility when there's any usage, max 100%
    return uploadCount > 0 ? Math.max(5, Math.min(100, percentageUsed)) : 0;
  }

  function getUsageDisplayText(
    uploadCount: number,
    uploadLimit: number
  ): string {
    if (uploadLimit === Number.MAX_SAFE_INTEGER) {
      return `${uploadCount} uploads used`;
    }
    return `${uploadCount} / ${uploadLimit} uploads used`;
  }

  // Utility function to determine progress bar color based on usage
  function getProgressBarColor(
    uploadCount: number,
    uploadLimit: number
  ): string {
    if (uploadLimit === Number.MAX_SAFE_INTEGER) {
      return "bg-green-500"; // Green for unlimited
    }

    const percentageUsed = (uploadCount / uploadLimit) * 100;

    if (percentageUsed >= 90) return "bg-red-500"; // Red when almost full
    if (percentageUsed >= 70) return "bg-orange-500"; // Orange when getting full
    if (percentageUsed >= 50) return "bg-yellow-500"; // Yellow when half full
    return "bg-green-500"; // Green when plenty left
  }

  const usagePercentage = calculateUploadUsagePercentage(
    sub_data.upload_tracker.upload_count,
    sub_data.upload_tracker.limit
  );
  const remainingUploads =
    sub_data.upload_tracker.limit === Number.MAX_SAFE_INTEGER
      ? "Unlimited"
      : sub_data.upload_tracker.limit - sub_data.upload_tracker.upload_count;

  const progressBarColor = getProgressBarColor(
    sub_data.upload_tracker.upload_count,
    sub_data.upload_tracker.limit
  );

  const currency_symbol = getCurrencySymbol(sub_data.plan_details.currency);
  return (
    <div className=" bg-white rounded-md shadow-sm border border-slate-200 p-5 max-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fluid-xs font-semibold text-slate-900">
          Your Subscription
        </h3>
        <div
          className={`px-3 py-1 rounded-lg text-fluid-xxs font-semibold ${
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
            <>
              <div className="mt-3">
                <div className="flex justify-between text-fluid-xxs text-slate-600 mb-1">
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
              <div className="mt-3">
                {/* Usage stats */}
                <div className="flex justify-between text-fluid-xxs text-slate-500 mb-2">
                  <span>
                    {getUsageDisplayText(
                      sub_data.upload_tracker.upload_count,
                      sub_data.upload_tracker.limit
                    )}
                  </span>

                  <div className="flex items-center gap-x-1">
                    <span>
                      {sub_data.upload_tracker.limit === Number.MAX_SAFE_INTEGER
                        ? "Unlimited"
                        : `${remainingUploads} remaining`}
                    </span>

                    {/* Optional: Usage percentage display */}
                    {sub_data.upload_tracker.limit !==
                      Number.MAX_SAFE_INTEGER && (
                      <div className="text-right text-fluid-xxs text-slate-600">
                        (
                        {Math.round(
                          (sub_data.upload_tracker.upload_count /
                            sub_data.upload_tracker.limit) *
                            100
                        )}
                        % used)
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
                    style={{
                      width: `${usagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
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
