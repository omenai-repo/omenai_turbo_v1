"use client";

import { galleryPricingStore } from "@omenai/shared-state-store/src/gallery/gallery_pricing/GalleryPricing";

export default function PackageTab() {
  const { activeTab, updateActiveTab } = galleryPricingStore();
  return (
    <div className="p-2 rounded-lg flex gap-2 bg-gray-400 w-fit">
      <div
        className={`p-2 ${
          activeTab === "monthly"
            ? "bg-white  text-gray-700"
            : "bg-transparent text-gray-700"
        }  cursor-pointer rounded-lg`}
        onClick={() => updateActiveTab("monthly")}
      >
        Monthly billing
      </div>

      <div
        className={`p-2 ${
          activeTab === "annual"
            ? "bg-white  text-gray-700"
            : "bg-transpaerent text-gray-700"
        }  cursor-pointer rounded-lg`}
        onClick={() => updateActiveTab("annual")}
      >
        Annual Billing
      </div>
    </div>
  );
}
