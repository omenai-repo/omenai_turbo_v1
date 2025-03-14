import React, { ChangeEvent } from "react";
import { gallery_signup_step_two } from "../../../../mocks/input/gallery/inputMock";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import Input from "../form/components/Input";
import SelectInput from "../form/components/Select";
import ActionButtons from "../actions/ActionButtons";

export default function GallerySignupStepTwo() {
  const { updateGallerySignupData } = useGalleryAuthStore();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let fieldName = e.target.name;
    updateGallerySignupData(fieldName, e.target.value);
  }
  return (
    <div className="flex flex-col space-y-6">
      {gallery_signup_step_two.map((form_step, index) => {
        return (
          <div key={index}>
            {form_step.type === "select" ? (
              <SelectInput
                label={form_step.label}
                items={form_step.items as { code: string; name: string }[]}
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
      <ActionButtons />
    </div>
  );
}
