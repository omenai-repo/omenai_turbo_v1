"use client";

import { ChangeEvent } from "react";
import FormConfirm from "../../formConfirm/FormConfirm";

import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { inputProperties } from "../../../../../mocks/input/gallery/inputMock";
import GallerySignUpStepOne from "../../steps/GallerySignUpStepOne";
import GallerySignupStepTwo from "../../steps/GallerySignupStepTwo";
import GallerySignUpStepThree from "../../steps/GallerySignupStepThree";
import GallerySignupStepfour from "../../steps/GallerySignupStepfour";
import StepCount from "../../steps/StepCount";

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
      <div className="max-w-full">
        {currentGallerySignupFormIndex === 0 && <GallerySignUpStepOne />}
        {currentGallerySignupFormIndex === 1 && <GallerySignupStepTwo />}
        {currentGallerySignupFormIndex === 2 && <GallerySignUpStepThree />}
        {currentGallerySignupFormIndex === 3 && <GallerySignupStepfour />}
        {currentGallerySignupFormIndex === 4 && <FormConfirm />}
      </div>

      <div className="flex justify-center w-full">
        <div className="mt-12 max-w-[300px] w-full">
          <StepCount />
        </div>
      </div>
    </>
  );
}
