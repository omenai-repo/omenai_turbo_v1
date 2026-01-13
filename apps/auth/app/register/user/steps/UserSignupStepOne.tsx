import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import React from "react";
import { inputProperties } from "../../../mocks/input/gallery/inputMock";
import { user_signup_step_one } from "../../../mocks/input/individual/InputMock";
import ActionButton from "../features/actions/ActionButton";
import Input from "../features/form/components/Input";
import Preferences from "../features/preferences/Preferences";
import TC from "../features/TC/TC";

export default function UserSignupStepOne() {
  return (
    <div className="flex flex-col space-y-6">
      <>
        {user_signup_step_one.map((form_input) => {
          return (
            <Input
              label={form_input.label}
              type={form_input.type}
              placeholder={form_input.placeholder}
              labelText={form_input.labelText}
              id={form_input.id}
              key={form_input.id}
            />
          );
        })}
      </>

      <ActionButton />
    </div>
  );
}
