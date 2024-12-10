"use client";

import Input from "./Input";
import { ChangeEvent } from "react";
import FormConfirm from "../../formConfirm/FormConfirm";
import SelectInput from "./Select";
import ImageUpload from "./ImageUpload";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { inputProperties } from "../../../../../mocks/input/gallery/inputMock";

export default function FormController() {
  const { currentGallerySignupFormIndex, updateGallerySignupData } =
    useGalleryAuthStore();

  let form = inputProperties[currentGallerySignupFormIndex];

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateGallerySignupData(fieldName, e.target.value);
  }

  return (
    <>
      <p className="text-xs text-[#858585] px-4">
        Step {currentGallerySignupFormIndex + 1} of {inputProperties.length + 1}
      </p>
      {currentGallerySignupFormIndex < inputProperties.length &&
        (form.type === "select" ? (
          <SelectInput
            label={form.label}
            items={form.items}
            name={form.label}
            required={false}
            labelText={form.labelText}
          />
        ) : form.type === "logo" ? (
          <ImageUpload />
        ) : (
          <Input
            label={form.label}
            type={form.type}
            placeholder={form.placeholder}
            buttonType={form.buttonType}
            buttonText={form.buttonText}
            labelText={form.labelText}
            onChange={handleChange}
          />
        ))}

      {currentGallerySignupFormIndex === inputProperties.length && (
        <FormConfirm />
      )}
    </>
  );
}
