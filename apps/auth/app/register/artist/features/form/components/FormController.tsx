"use client";

import { ChangeEvent } from "react";
import FormConfirm from "../../formConfirm/FormConfirm";
import ArtistSignUpStepOne from "../../steps/ArtistSignUpStepOne";
import ArtistSignupStepTwo from "../../steps/ArtistSignupStepTwo";
import ArtistSignUpStepThree from "../../steps/ArtistSignupStepThree";
import ArtistSignupStepfour from "../../steps/ArtistSignupStepfour";
import StepCount from "../../steps/StepCount";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import ArtistSignupStepFive from "../../steps/ArtistSignupStepFive";

export default function FormController() {
  const { currentArtistSignupFormIndex, updateArtistSignupData } =
    useArtistAuthStore();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateArtistSignupData(fieldName, e.target.value);
  }

  return (
    <>
      {currentArtistSignupFormIndex === 0 && <ArtistSignUpStepOne />}
      {currentArtistSignupFormIndex === 1 && <ArtistSignupStepTwo />}
      {currentArtistSignupFormIndex === 2 && <ArtistSignUpStepThree />}
      {currentArtistSignupFormIndex === 3 && <ArtistSignupStepfour />}
      {currentArtistSignupFormIndex === 4 && <ArtistSignupStepFive />}
      {currentArtistSignupFormIndex === 5 && <FormConfirm />}

      <div className="flex justify-center w-full">
        <div className="mt-12 max-w-[300px] w-full">
          <StepCount />
        </div>
      </div>
    </>
  );
}
