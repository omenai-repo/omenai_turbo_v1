import React, { ChangeEvent } from "react";
import Input from "../form/components/Input";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import ActionButtons from "../actions/ActionButtons";
import { artist_signup_step_three } from "../../../../mocks/input/artist/inputMock";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";

export default function ArtistSignUpStepThree() {
  const { updateArtistSignupData, isFieldDirty } = useArtistAuthStore();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateArtistSignupData(fieldName, e.target.value);
  }
  return (
    <div className="flex flex-col space-y-6">
      {artist_signup_step_three.map((form_step, index) => {
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
