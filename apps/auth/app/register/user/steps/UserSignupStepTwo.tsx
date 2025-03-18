import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { user_signup_step_two } from "../../../mocks/input/individual/InputMock";
import ActionButton from "../features/actions/ActionButton";
import Input from "../features/form/components/Input";
import SelectInput from "../features/form/components/Select";
import { ICountry, IState, ICity } from "country-state-city";

export default function UserSignupStepTwo() {
  return (
    <div className="flex flex-col space-y-6">
      <>
        {user_signup_step_two.map((form_step, index) => {
          return (
            <div key={index}>
              {form_step.type === "select" ? (
                <SelectInput
                  label={form_step.label}
                  items={form_step.items as ICountry[] | IState[] | ICity[]}
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
                />
              )}
            </div>
          );
        })}
      </>

      <ActionButton />
    </div>
  );
}
