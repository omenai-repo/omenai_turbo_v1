"use client";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
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
      <label htmlFor={name} className="text-dark font-light text-fluid-xxs">
        {label}
      </label>
      <select
        onChange={handleChange}
        required={required}
        className={SELECT_CLASS}
      >
        <option value={""}>Select</option>

        {items!.map((item, index) => {
          return (
            <option
              key={item}
              value={item}
              className="px-3 py-5 my-5 font-light text-fluid-xxs text-dark"
            >
              {item}
            </option>
          );
        })}
      </select>
    </div>
  );
}
