"use client";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { uploadArtworkPriceInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { useState } from "react";
import { Loader, RefreshCcwDot, ArrowRightLeft } from "lucide-react";
import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";

export default function ArtworkPriceInputGroup() {
  const { artworkUploadData, updateArtworkUploadData } =
    galleryArtworkUploadStore();
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();

  const [conversionLoading, setConversionLoading] = useState(false);

  const handleCurrencyConversion = async () => {
    const value =
      artworkUploadData.price > 0 ? artworkUploadData.price.toString() : "";
    setConversionLoading(true);
    try {
      const conversion_value = await getCurrencyConversion(
        artworkUploadData.currency.toUpperCase(),
        +value,
        csrf || "",
      );

      if (!conversion_value?.isOk)
        toast_notif(
          "Issue encountered while retrieving exchange rate value. Please try again.",
          "error",
        );
      else {
        const rounded_conversion_value =
          Math.round(+conversion_value.data * 10) / 10;
        updateArtworkUploadData(
          "usd_price",
          rounded_conversion_value.toString(),
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "An error occurred while converting the currency. Please try again.",
        "error",
      );
      return;
    } finally {
      setConversionLoading(false);
    }
  };

  return (
    <div className="my-10 w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-dark font-medium text-md">Artwork Pricing</h2>
        <p className="text-slate-500 text-sm">
          Set the value of your artwork and manage visibility.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* Info Alert Box */}
        <div className="mb-8 bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1 min-w-[4px] h-[4px] rounded-full bg-amber-500" />
          <p className="text-amber-800 text-xs leading-relaxed">
            <span className="font-semibold block mb-1">
              Currency Standardization
            </span>
            To ensure consistent pricing across the platform, all uploaded
            prices will be converted and displayed in US Dollar equivalents.
            Please enter your local price below and hit the refresh button to
            calculate.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Pricing Conversion Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Left Side: Local Currency & Price */}
            <div className="lg:col-span-5 flex gap-3">
              <div className="w-1/3">
                <ArtworkSelectInput
                  label={uploadArtworkPriceInputMocks[0].label}
                  name={uploadArtworkPriceInputMocks[0].name}
                  required={uploadArtworkPriceInputMocks[0].required}
                  currency_items={uploadArtworkPriceInputMocks[0].currencies}
                  disabled={false}
                />
              </div>
              <div className="w-2/3">
                <ArtworkTextInput
                  disabled={artworkUploadData.currency === ""}
                  label={uploadArtworkPriceInputMocks[1].label}
                  placeholder={uploadArtworkPriceInputMocks[1].placeholder}
                  name={uploadArtworkPriceInputMocks[1].name}
                  required={uploadArtworkPriceInputMocks[1].required}
                  value={
                    artworkUploadData.price > 0
                      ? artworkUploadData.price.toString()
                      : ""
                  }
                />
              </div>
            </div>

            {/* Middle: Conversion Action */}
            <div className="lg:col-span-2 flex items-center justify-center pb-3">
              <button
                onClick={handleCurrencyConversion}
                type="button"
                disabled={
                  artworkUploadData.price.toString() === "0" ||
                  artworkUploadData.price.toString() === "" ||
                  conversionLoading
                }
                className="group relative h-10 w-10 flex items-center justify-center rounded-full bg-dark text-white shadow-md hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                title="Convert to USD"
              >
                {conversionLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <RefreshCcwDot
                    size={18}
                    className="group-hover:rotate-180 transition-transform duration-500"
                  />
                )}
              </button>
            </div>

            {/* Right Side: USD Result */}
            <div className="lg:col-span-5">
              <ArtworkTextInput
                disabled={true}
                label={"USD Equivalent (Calculated)"}
                name={"usd_price"}
                required={true}
                value={
                  artworkUploadData.usd_price > 0
                    ? artworkUploadData.usd_price.toString()
                    : ""
                }
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Bottom Row: Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <ArtworkSelectInput
                label={uploadArtworkPriceInputMocks[2].label}
                name={uploadArtworkPriceInputMocks[2].name}
                required={uploadArtworkPriceInputMocks[2].required}
                items={uploadArtworkPriceInputMocks[2].options}
                disabled={
                  user.subscription_status.type === null ||
                  ["basic", "pro"].includes(
                    user.subscription_status.type.toLowerCase(),
                  )
                }
              />
              {(user.subscription_status.type === null ||
                ["basic", "pro"].includes(
                  user.subscription_status.type.toLowerCase(),
                )) && (
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * Upgrade your plan to unlock advanced pricing visibility
                  options.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
