"use client";

import Preferences from "../../preferences/Preferences";
import TC from "../../TC/TC";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import UserSignupStepOne from "../../../steps/UserSignupStepOne";
import UserSignupStepTwo from "../../../steps/UserSignupStepTwo";
import StepCount from "../../../component/StepCount";

export default function FormController() {
  const { currentSignupFormIndex, updateSignUpData } = useIndividualAuthStore();

  return (
    <>
      {currentSignupFormIndex === 0 && <UserSignupStepOne />}
      {currentSignupFormIndex === 1 && <UserSignupStepTwo />}
      {currentSignupFormIndex === 2 && <Preferences />}
      {currentSignupFormIndex === 3 && <TC />}

      <div className="flex justify-center w-full">
        <div className="mt-12 max-w-[300px] w-full">
          <StepCount />
        </div>
      </div>
    </>
  );
}
