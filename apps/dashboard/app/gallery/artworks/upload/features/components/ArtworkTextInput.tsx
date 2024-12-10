"use client";
import { validate } from "@omenai/shared-lib/validations/upload_artwork_input_validator/validator";
import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

type ArtworkTextInputProps = {
  label: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required: boolean;
  type?: string;
  disabled?: boolean;
  value?: string;
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
      updateErrorField(label, "");
    }

    if (label === "price") {
      const conversion_value = await getCurrencyConversion(
        artworkUploadData.currency.toUpperCase(),
        +value
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
        updateArtworkUploadData("usd_price", conversion_value.data);
      }
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 ${
        type === "textarea" && "lg:last:col-span-4 md:last:col-span-2"
      } `}
    >
      <label htmlFor={name} className="text-[#858585] font-normal text-xs">
        {label}
      </label>
      {type === "text" && (
        <input
          name={name}
          required={required}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={value}
          onChange={(e) => handleChange(e.target.value, name)}
          className="border px-2 ring-0 text-xs text-[#858585] disabled:cursor-not-allowed disabled:bg-[#E0E0E0] border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
        />
      )}
      {type === "textarea" && (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={2}
          onChange={(e) => handleChange(e.target.value, name)}
          className="border px-2 ring-0 text-xs text-[#858585] disabled:cursor-not-allowed disabled:bg-[#E0E0E0] border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
        />
      )}
      {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <p key={`${error}-error_list`} className="text-red-600 text-xs">
              {error}
            </p>
          );
        })}
    </div>
  );
}
