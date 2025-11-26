import React, { ChangeEvent } from "react";
import Input from "../form/components/Input";
import SelectInput from "../form/components/Select";
import ActionButtons from "../actions/ActionButtons";
import { artist_signup_step_two } from "../../../../mocks/input/artist/inputMock";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";

export default function ArtistSignupStepTwo() {
  const { updateArtistSignupData } = useArtistAuthStore();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateArtistSignupData(fieldName, e.target.value);
  }
  return (
    <div className="flex flex-col space-y-6">
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
        {artist_signup_step_two.map((form_step, index) => {
          return (
            <div key={index}>
              {form_step.type === "select" ? (
                <SelectInput
                  label={form_step.label}
                  items={
                    form_step.items as {
                      name: string;
                      alpha2: string;
                      alpha3: string;
                      currency: string;
                    }[]
                  }
                  name={form_step.label}
                  required={false}
                  labelText={form_step.labelText}
                />
              ) : (
                <Input
                  label={form_step.label}
                  type={form_step.type}
                  placeholder={form_step.placeholder}
                  buttonType={"button"}
                  buttonText={"Continue"}
                  labelText={form_step.labelText}
                  onChange={handleChange}
                />
              )}
            </div>
          );
        })}
      </div>
      <ActionButtons />
    </div>
  );
}
