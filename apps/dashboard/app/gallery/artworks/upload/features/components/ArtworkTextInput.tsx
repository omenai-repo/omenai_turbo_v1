"use client";
import { validate } from "@omenai/shared-lib/validations/upload_artwork_input_validator/validator";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { ChangeEvent, useState } from "react";

type ArtworkTextInputProps = {
  label: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required: boolean;
  type?: string;
  disabled?: boolean;
  value?: string | number;
};
export default function ArtworkTextInput({
  label,
  placeholder,
  name,
  required,
  disabled,
  value,
  type = "text",
}: ArtworkTextInputProps) {
  const { updateArtworkUploadData, updateErrorField, artworkUploadData } =
    galleryArtworkUploadStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = async (value: string, label: string) => {
    const trimmedValue = trimWhiteSpace(value);

    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(label, trimmedValue);
    if (!success) {
      setErrorList(errors);
      updateErrorField(label, trimmedValue);
    } else {
      updateArtworkUploadData(label, trimmedValue);
      updateArtworkUploadData("usd_price", 0);
      updateErrorField(label, "");
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 ${
        type === "textarea" && "lg:last:col-span-4 md:last:col-span-2"
      } `}
    >
      <label
        htmlFor={name}
        className="text-dark whitespace-nowrap font-normal text-fluid-xxs"
      >
        {label}
      </label>
      {type === "text" && (
        <input
          name={name}
          required={required}
          type={
            ["price", "year", "birth_year"].includes(name) ? "number" : "text"
          }
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value, name)}
          className={`${errorList.length > 0 ? "ring-red-600 focus:ring-red-600" : " focus:ring-dark ring-dark/20"} 
          w-full bg-transparent border border-dark/30 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 p-3 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed`}
        />
      )}
      {type === "textarea" && (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          onChange={(e) => handleChange(e.target.value, name)}
          className="border px-2 ring-0 rounded  disabled:cursor-not-allowed disabled:bg-dark/10 border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light text-fluid-xxs placeholder:text-[#858585] placeholder:text-fluid-xxs"
        />
      )}
      {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <p
              key={`${error}-error_list`}
              className="text-red-600 text-fluid-xxs"
            >
              {error}
            </p>
          );
        })}
    </div>
  );
}
