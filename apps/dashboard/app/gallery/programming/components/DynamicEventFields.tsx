// components/programming/DynamicEventFields.tsx
import { GalleryEventType } from "@omenai/shared-types";
import React from "react";
import { PremiumDateInput } from "./PremiumDateInput";
import { PremiumCountrySelect } from "./PremiumCountrySelect";

interface DynamicEventFieldsProps {
  currentType: GalleryEventType;
  formData: any; // Local state is flexible
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

export const DynamicEventFields = ({
  currentType,
  formData,
  errors,
  onChange,
}: DynamicEventFieldsProps) => {
  if (currentType === "viewing_room") {
    return (
      <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-6 border-t border-neutral-100">
        <h3 className="text-sm font-medium text-dark mb-6">Digital Access</h3>
        <div className="w-full">
          <label className=" text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            External Portal URL (Optional)
          </label>
          <input
            value={formData.external_url || ""}
            onChange={(e) => onChange("external_url", e.target.value)}
            placeholder="https://..."
            className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-dark focus:ring-0 outline-none transition-colors"
          />
          {errors.external_url && (
            <p className="text-[10px] text-red-500 mt-1">
              {errors.external_url}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-6 border-t border-neutral-100 space-y-8">
      <div>
        <h3 className="text-sm font-medium text-dark mb-6">Location Details</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label className=" text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              Venue Name
            </label>
            <input
              value={formData.location?.venue || ""}
              onChange={(e) => onChange("location.venue", e.target.value)}
              placeholder={
                currentType === "art_fair"
                  ? "e.g. Miami Beach Convention Center"
                  : "e.g. Main Gallery Space"
              }
              className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-dark focus:ring-0 outline-none transition-colors"
            />
            {errors["location.venue"] && (
              <p className="text-[10px] text-red-500 mt-1">
                {errors["location.venue"]}
              </p>
            )}
          </div>
          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
              Event Location (Country)
            </label>
            <PremiumCountrySelect
              value={formData.country || ""}
              onChange={(e: string) => onChange("country", e)}
              error={errors["location.country"]}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label className=" text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              City
            </label>
            <input
              value={formData.location?.city || ""}
              onChange={(e) => onChange("location.city", e.target.value)}
              placeholder="e.g. Miami"
              className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-dark focus:ring-0 outline-none transition-colors"
            />
            {errors["location.city"] && (
              <p className="text-[10px] text-red-500 mt-1">
                {errors["location.city"]}
              </p>
            )}
          </div>
        </div>
      </div>

      {currentType === "art_fair" && (
        <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in duration-300">
          <div className="w-full sm:w-1/3 relative group/tooltip cursor-help">
            <label className=" text-[10px] uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1">
              Booth Number
            </label>
            <input
              value={formData.booth_number || ""}
              onChange={(e) => onChange("booth_number", e.target.value)}
              placeholder="e.g. A14"
              className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-dark focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div className="w-full relative group/tooltip cursor-help mb-2">
            <label className=" text-[10px] uppercase tracking-widest text-neutral-500 ">
              VIP Preview Date (Optional)
            </label>

            <PremiumDateInput
              value={formData.vip_preview_date}
              onChange={(val: string) => onChange("vip_preview_date", val)}
              placeholder="SELECT VIP PREVIEW DATE"
              error={errors["vip_preview_date"]}
              disablePastDates={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
