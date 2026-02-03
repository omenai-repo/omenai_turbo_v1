"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { validate } from "@omenai/shared-lib/validations/upload_artwork_input_validator/validator";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { ChangeEvent, useEffect, useState } from "react";
import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

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

  // Helper to determine the unit to display
  const getUnit = (labelText: string) => {
    const l = labelText.toLowerCase();
    // Check for dimension keywords
    if (
      l.includes("length") ||
      l.includes("height") ||
      l.includes("width") ||
      l.includes("depth")
    ) {
      return "in";
    }
    // Check for weight
    if (l.includes("weight")) {
      return "kg";
    }
    return null;
  };

  const unit = getUnit(label);

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
        <div className="relative w-full">
          <input
            name={name}
            required={required}
            type="text"
            disabled={disabled}
            placeholder={placeholder}
            defaultValue={value}
            onChange={(e) => handleChange(e.target.value, name)}
            // Increased padding-right to pr-12 to accommodate the new badge
            className={`${INPUT_CLASS} ${unit ? "pr-12" : ""}`}
          />
          {unit && (
            // Premium styled unit indicator
            <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-dark text-white text-xs font-medium p-3 rounded pointer-events-none select-none shadow-sm">
              {unit}
            </div>
          )}
        </div>
      )}

      {type === "textarea" && (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          onChange={(e) => handleChange(e.target.value, name)}
          className={TEXTAREA_CLASS}
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
