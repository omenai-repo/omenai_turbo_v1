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
};

type CurrencyItems = { name: string; code: string };
export default function ArtworkSelectInput({
  label,
  items,
  name,
  required,
  currency_items,
}: ArtworkSelectInputProps) {
  const { updateArtworkUploadData } = galleryArtworkUploadStore();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // if (name === "currency") {
    //   updateArtworkUploadData("price", "0");
    //   updateArtworkUploadData("usd_price", "0");
    // }

    updateArtworkUploadData(name, e.target.value);
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-dark/80 font-normal text-xs">
        {label}
      </label>
      <select
        onChange={handleChange}
        required={required}
        className="border px-2 ring-0 text-[14px] text-dark border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
      >
        <option value="">Select</option>
        {name === "currency" ? (
          <>
            {currency_items!.map((item: CurrencyItems, index) => {
              return (
                <option
                  key={item.code}
                  value={item.code}
                  className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
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
                  className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
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
