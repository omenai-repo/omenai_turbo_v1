"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { validate } from "@omenai/shared-lib/validations/upload_artwork_input_validator/validator";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { ChangeEvent, useEffect, useState } from "react";

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
    artistArtworkUploadStore();
  const { user } = useAuth({ requiredRole: "artist" });

  useEffect(() => {
    if (name === "artist") updateArtworkUploadData(name, user.name as string);
  }, []);

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
  };

  return (
    <div
      className={`flex flex-col gap-1 ${
        type === "textarea" && "lg:last:col-span-4 md:last:col-span-2"
      } `}
    >
      <label
        htmlFor={name}
        className="text-dark whitespace-nowrap font-normal text-fluid-xs"
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
          className="w-full focus:ring ring-1 border-0 disabled:cursor-not-allowed disabled:ring-dark/10 disabled:text-[#e0e0e0] ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-md text-fluid-xxs placeholder:text-dark/40 placeholder:text-fluid-xs"
        />
      )}
      {type === "textarea" && (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          onChange={(e) => handleChange(e.target.value, name)}
          className="border px-2 ring-0 rounded-[10px]  disabled:cursor-not-allowed disabled:bg-dark/10 border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light text-fluid-xxs placeholder:text-[#858585] placeholder:text-fluid-xs"
        />
      )}
      {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <p
              key={`${error}-error_list`}
              className="text-red-600 text-fluid-xs"
            >
              {error}
            </p>
          );
        })}
    </div>
  );
}
