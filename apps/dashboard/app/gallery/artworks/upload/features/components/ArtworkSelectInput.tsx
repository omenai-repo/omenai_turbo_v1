"use client";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { ChangeEvent } from "react";

type ArtworkSelectInputProps = {
  label: string;
  items?: string[] | undefined;
  currency_items?: CurrencyItems[] | undefined;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
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
  const { updateArtworkUploadData } = galleryArtworkUploadStore();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateArtworkUploadData(name, e.target.value);
    if (name === "currency") {
      updateArtworkUploadData("price", "0");
      updateArtworkUploadData("usd_price", "0");
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-dark font-normal text-fluid-xs">
        {label}
      </label>
      <select
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className="border-0 ring-1 disabled:cursor-not-allowed ring-dark/20 focus:ring text-fluid-xs focus:ring-dark px-6 py-2 sm:py-3 rounded-full "
      >
        <option value={disabled ? "Yes" : ""}>
          {disabled ? "Yes" : "Select"}
        </option>
        {name === "currency" ? (
          <>
            {currency_items!.map((item: CurrencyItems, index) => {
              return (
                <option
                  key={item.code}
                  value={item.code}
                  className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                >
                  {item.name}
                </option>
              );
            })}
          </>
        ) : (
          <>
            {items!.map((item, index) => {
              return (
                <option
                  key={item}
                  value={item}
                  className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                >
                  {item}
                </option>
              );
            })}
          </>
        )}
      </select>
    </div>
  );
}
