"use client";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { ChangeEvent } from "react";

type ArtworkSelectInputProps = {
  label: string;
  items?: string[] | undefined;
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
}: ArtworkSelectInputProps) {
  const { updateArtworkUploadData } = artistArtworkUploadStore();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateArtworkUploadData(name, e.target.value);
  };
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-gray-700/80 font-normal text-[14px]"
      >
        {label}
      </label>
      <select
        onChange={handleChange}
        required={required}
        className="border-0 ring-1 disabled:cursor-not-allowed ring-dark/20 focus:ring text-xs focus:ring-dark px-6 py-2 sm:py-3 rounded-full "
      >
        <option value={""}>Select</option>

        {items!.map((item, index) => {
          return (
            <option
              key={item}
              value={item}
              className="px-3 py-5 my-5 font-normal text-[14px] text-gray-700"
            >
              {item}
            </option>
          );
        })}
      </select>
    </div>
  );
}
