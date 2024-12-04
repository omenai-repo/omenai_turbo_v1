import { checkLabel } from "./checkLabel";
import { validateConfirmPassword } from "./confirmPasswordValidator";
import { validateEmail } from "./emailValidator";
import { validataGeneralText } from "./generalValidator";
import { validatePassword } from "./passwordValidator";
import { validateText } from "./textValidator";

type ValidationFunction = (value: string) => string[];

export function validate(
  value: string,
  label: string,
  confirm?: string
): { success: boolean; errors: string[] | [] } {
  const validationFunctions: Record<string, ValidationFunction> = {
    name: (value: string) => validateText(value),
    email: (value: string) => validateEmail(value),
    password: (value: string) => validatePassword(value),
    confirmPassword: (value: string) => validateConfirmPassword(value, confirm),
    general: (value: string) => validataGeneralText(value),
  };

  const validationFunction = validationFunctions[checkLabel(label)];

  let nameErrors = validationFunction(value);

  return {
    success: nameErrors.length === 0,
    errors: nameErrors,
  };
}
