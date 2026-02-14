import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import { CurrencySelect } from "./CurrencySelect";
import { GenericSelect } from "../../../../../components/GenericSelect";
// --- Types ---
type ArtworkSelectInputProps = {
  label: string;
  items?: string[] | undefined;
  currency_items?: CurrencyItems[] | undefined;
  name: string;
  required: boolean;
  disabled?: boolean;
};
type CurrencyItems = { name: string; code: string };

export default function ArtworkSelectInput({
  label,
  items,
  name,
  required,
  currency_items,
  disabled = false,
}: ArtworkSelectInputProps) {
  const { artworkUploadData, updateArtworkUploadData } =
    galleryArtworkUploadStore();

  // Handle Generic Native Select Change
  const handleGenericChange = (val: string) => {
    updateArtworkUploadData(name, val);
  };

  // Handle Custom Currency Change
  const handleCurrencyChange = (code: string) => {
    updateArtworkUploadData(name, code);
    // Reset prices when currency changes to force recalculation
    updateArtworkUploadData("price", "0");
    updateArtworkUploadData("usd_price", "0");
  };

  // Decide which value to read from store based on the name prop
  // (Assuming your store has a shape that matches `name`)
  const currentValue =
    // @ts-ignore - Dynamic access to store data
    artworkUploadData[name] || "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-dark font-medium text-xs ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {name === "currency" && currency_items ? (
        //  - Render Custom Component
        <CurrencySelect
          items={currency_items}
          value={currentValue}
          onChange={handleCurrencyChange}
          disabled={disabled}
        />
      ) : (
        <GenericSelect
          items={items || []}
          value={currentValue}
          onChange={handleGenericChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
