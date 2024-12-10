"use client";

import Input from "./Input";
import Preferences from "../../preferences/Preferences";
import { ChangeEvent } from "react";
import TC from "../../TC/TC";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { inputProperties } from "../../../../../mocks/input/gallery/inputMock";

export default function FormController() {
  const { currentSignupFormIndex, updateSignUpData } = useIndividualAuthStore();

  let form = inputProperties[currentSignupFormIndex];

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateSignUpData(fieldName, e.target.value);
  }

  return (
    <>
      <p className="text-xs text-[#858585] px-4">
        Step {currentSignupFormIndex + 1} of {inputProperties.length + 2}
      </p>
      {currentSignupFormIndex < inputProperties.length && (
        <Input
          label={form.label}
          type={form.type}
          placeholder={form.placeholder}
          labelText={form.labelText}
          id={form.id}
          onChange={handleChange}
        />
      )}

      {currentSignupFormIndex === inputProperties.length && <Preferences />}
      {currentSignupFormIndex === inputProperties.length + 1 && <TC />}
    </>
  );
}
