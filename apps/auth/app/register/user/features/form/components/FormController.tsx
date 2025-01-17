"use client";

import Preferences from "../../preferences/Preferences";
import TC from "../../TC/TC";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import UserSignupStepOne from "../../../steps/UserSignupStepOne";
import UserSignupStepTwo from "../../../steps/UserSignupStepTwo";

export default function FormController() {
  const { currentSignupFormIndex, updateSignUpData } = useIndividualAuthStore();

  return (
    <div className="flex flex-col space-y-6">
      {currentSignupFormIndex === 0 && <UserSignupStepOne />}
      {currentSignupFormIndex === 1 && <UserSignupStepTwo />}
      {currentSignupFormIndex === 2 && <Preferences />}
      {currentSignupFormIndex === 3 && <TC />}
    </div>
  );
}
