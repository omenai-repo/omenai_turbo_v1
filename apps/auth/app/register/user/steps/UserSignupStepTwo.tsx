import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { user_signup_step_two } from "../../../mocks/input/individual/InputMock";
import ActionButton from "../features/actions/ActionButton";
import Input from "../features/form/components/Input";

export default function UserSignupStepTwo() {
  const { isFieldDirty } = useIndividualAuthStore();

  return (
    <div className="flex flex-col space-y-6">
      <>
        {user_signup_step_two.map((form_input) => {
          return (
            <Input
              label={form_input.label}
              type={form_input.type}
              placeholder={form_input.placeholder}
              labelText={form_input.labelText}
              id={form_input.id}
              key={form_input.id}
              disabled={
                form_input.labelText === "confirmPassword" &&
                isFieldDirty.password
              }
            />
          );
        })}
      </>

      <ActionButton />
    </div>
  );
}
