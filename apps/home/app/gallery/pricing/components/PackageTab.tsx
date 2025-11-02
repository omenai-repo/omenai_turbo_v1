"use client";

import { galleryPricingStore } from "@omenai/shared-state-store/src/gallery/gallery_pricing/GalleryPricing";

export default function PackageTab() {
  const { activeTab, updateActiveTab } = galleryPricingStore();
  return (
    <div className="p-2 rounded flex gap-2 bg-gray-400 w-fit">
      <div
        role="button"
        className={`p-2 ${
          activeTab === "monthly"
            ? "bg-white  text-dark"
            : "bg-transparent text-dark"
        }  cursor-pointer rounded`}
        onClick={() => updateActiveTab("monthly")}
      >
        Monthly billing
      </div>

      <div
        role="button"
        className={`p-2 ${
          activeTab === "annual"
            ? "bg-white  text-dark"
            : "bg-transpaerent text-dark"
        }  cursor-pointer rounded`}
        onClick={() => updateActiveTab("annual")}
      >
        Annual Billing
      </div>
    </div>
  );
}
