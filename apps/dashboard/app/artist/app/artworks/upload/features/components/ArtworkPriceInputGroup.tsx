"use client";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { uploadArtworkPriceInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { GallerySchemaTypes } from "@omenai/shared-types";

export default function ArtworkPriceInputGroup() {
  const { artworkUploadData } = galleryArtworkUploadStore();
  const { session } = useContext(SessionContext);

  const currency_symbol = getCurrencySymbol(artworkUploadData.currency);
  const usd_symbol = getCurrencySymbol("USD");
  return (
    <div className="my-10">
      <h2 className="text-gray-700 font-normal text-base my-4">
        Artwork Pricing
      </h2>

      <div className="grid grid-cols-2 space-x-2 w-full">
        <div className="grid grid-cols-4 space-x-2 items-center w-full">
          <div className="col-span-1">
            <ArtworkSelectInput
              label={uploadArtworkPriceInputMocks[0].label}
              name={uploadArtworkPriceInputMocks[0].name}
              required={uploadArtworkPriceInputMocks[0].required}
              currency_items={uploadArtworkPriceInputMocks[0].currencies}
            />
          </div>

          <div className="relative col-span-3">
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

            {/* <BsCurrencyDollar className="absolute right-2 top-9 text-[#858585]" /> */}
          </div>
        </div>
        <div className="w-full">
          <ArtworkSelectInput
            label={uploadArtworkPriceInputMocks[2].label}
            name={uploadArtworkPriceInputMocks[2].name}
            required={uploadArtworkPriceInputMocks[2].required}
            items={uploadArtworkPriceInputMocks[2].options}
            disabled={
              (session as GallerySchemaTypes).subscription_status.type ===
                null ||
              (
                session as GallerySchemaTypes
              ).subscription_status.type?.toLowerCase() === "basic"
            }
          />
        </div>
      </div>
      <div className="w-full text-[15px] my-2">
        {artworkUploadData.currency !== "" &&
          artworkUploadData.price !== 0 &&
          artworkUploadData.usd_price !== 0 && (
            <span className=" text-gray-700 font-semibold">
              Exchange rate:{" "}
              {`${formatPrice(
                artworkUploadData.price,
                currency_symbol
              )} = ${formatPrice(artworkUploadData.usd_price, usd_symbol)}`}
            </span>
          )}

        <p className="font-semibold text-[14px] mt-1 text-red-600">
          Please note: To ensure consistent pricing across the platform, all
          uploaded prices will be displayed in US Dollar equivalents.
        </p>
      </div>
    </div>
  );
}
