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
        const rounded_conversion_value =
          Math.round(+conversion_value.data * 10) / 10;
        updateArtworkUploadData(
          "usd_price",
          rounded_conversion_value.toString()
        );
      }
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
        className="text-gray-700 whitespace-nowrap font-normal text-[14px]"
      >
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
          className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
        />
      )}
      {type === "textarea" && (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          onChange={(e) => handleChange(e.target.value, name)}
          className="border px-2 ring-0 rounded-[10px]  disabled:cursor-not-allowed disabled:bg-dark/10 border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-[#858585] placeholder:text-xs"
        />
      )}
      {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <p key={`${error}-error_list`} className="text-red-600 text-[14px]">
              {error}
            </p>
          );
        })}
    </div>
  );
}
