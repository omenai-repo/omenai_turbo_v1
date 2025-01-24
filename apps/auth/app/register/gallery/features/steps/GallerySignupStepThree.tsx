import React, { ChangeEvent } from "react";
import Input from "../form/components/Input";
import { gallery_signup_step_three } from "../../../../mocks/input/gallery/inputMock";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import ActionButtons from "../actions/ActionButtons";

export default function GallerySignUpStepThree() {
  const {
    currentGallerySignupFormIndex,
    updateGallerySignupData,
    gallerySignupData,
    isFieldDirty,
  } = useGalleryAuthStore();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateGallerySignupData(fieldName, e.target.value);
  }
  return (
    <div className="flex flex-col space-y-6">
      {gallery_signup_step_three.map((form_step, index) => {
        return (
          <div key={index}>
            <Input
              label={form_step.label}
              type={form_step.type}
              placeholder={form_step.placeholder}
              buttonType="button"
              buttonText="Continue"
              labelText={form_step.labelText}
              onChange={handleChange}
              disabled={
                form_step.labelText === "confirmPassword" &&
                isFieldDirty.password
              }
            />
          </div>
        );
      })}
      <ActionButtons />
    </div>
  );
}
