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
      <label htmlFor={name} className="text-dark font-normal text-fluid-xs">
        {label}
      </label>
      <select
        onChange={handleChange}
        required={required}
        className="border border-[#E0E0E0] ring-0 disabled:cursor-not-allowed outline-none focus:border-none text-fluid-xs focus:ring-dark py-2 px-3 rounded "
      >
        <option value={""}>Select</option>

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
      </select>
    </div>
  );
}
