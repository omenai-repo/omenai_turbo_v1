"use client";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { uploadArtworkPriceInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { useContext, useState } from "react";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { Loader, RefreshCcwDot } from "lucide-react";
import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function ArtworkPriceInputGroup() {
  const { artworkUploadData, updateArtworkUploadData } =
    galleryArtworkUploadStore();
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const [conversionLoading, setConversionLoading] = useState(false);

  const handleCurrencyConversion = async () => {
    const value =
      artworkUploadData.price > 0 ? artworkUploadData.price.toString() : "";
    setConversionLoading(true);
    try {
      const conversion_value = await getCurrencyConversion(
        artworkUploadData.currency.toUpperCase(),
        +value,
        csrf || ""
      );

      if (!conversion_value?.isOk)
        toast.error("Error notification", {
          description:
            "Issue encountered while retrieving exchange rate value. Please try again.",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        const rounded_conversion_value =
          Math.round(+conversion_value.data * 10) / 10;
        updateArtworkUploadData(
          "usd_price",
          rounded_conversion_value.toString()
        );
      }
    } catch (error) {
      console.error("Error during currency conversion:", error);
      toast.error("Error notification", {
        description:
          "An error occurred while converting the currency. Please try again.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    } finally {
      setConversionLoading(false);
    }
  };

  return (
    <div className="my-10">
      <h2 className="text-dark font-normal text-fluid-base my-4">
        Artwork Pricing
      </h2>

      <div className="grid grid-cols-2 2xl:grid-cols-3  w-full gap-4">
        <div className="grid grid-cols-4 col-span-2 space-x-2 items-center w-full">
          <div className="col-span-1">
            <ArtworkSelectInput
              label={uploadArtworkPriceInputMocks[0].label}
              name={uploadArtworkPriceInputMocks[0].name}
              required={uploadArtworkPriceInputMocks[0].required}
              currency_items={uploadArtworkPriceInputMocks[0].currencies}
            />
          </div>

          <div className="grid grid-cols-12 col-span-3 gap-2 w-full">
            <div className="relative w-full col-span-5">
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

            <div className="flex items-end justify-center col-span-2">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleCurrencyConversion}
                  type="button"
                  disabled={artworkUploadData.price === 0 || conversionLoading}
                  className="p-2 rounded-xl w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/40 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
                >
                  {conversionLoading ? (
                    <Loader color="rgba(255, 255, 255, 1)" size={20} />
                  ) : (
                    <RefreshCcwDot
                      size={20}
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                  )}
                </button>
                <span className="text-[11px] font-medium">
                  Click to convert
                </span>
              </div>
            </div>
            <div className="relative w-full col-span-5">
              <ArtworkTextInput
                disabled={true}
                label={"USD equivalent"}
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
        </div>
        <div className="w-full col-span-2 2xl:col-span-1">
          <ArtworkSelectInput
            label={uploadArtworkPriceInputMocks[2].label}
            name={uploadArtworkPriceInputMocks[2].name}
            required={uploadArtworkPriceInputMocks[2].required}
            items={uploadArtworkPriceInputMocks[2].options}
            disabled={
              user.subscription_status.type === null ||
              user.subscription_status.type?.toLowerCase() === "basic"
            }
          />
        </div>
      </div>
      <div className="w-full text-fluid-xxs my-2">
        <p className="font-semibold text-fluid-xxs mt-1 text-red-600">
          Please note: To ensure consistent pricing across the platform, all
          uploaded prices will be displayed in US Dollar equivalents.
        </p>
      </div>
    </div>
  );
}
