import { validate } from "./validatorGroup";

export function validatePasswordFields(fields: {
  password?: string;
  confirmPassword?: string;
}): string[] {
  if (fields.password) {
    const { success, errors } = validate(
      fields.password,
      "password",
      fields.password
    );
    if (!success) return errors;
  }

  if (fields.confirmPassword) {
    const { success, errors } = validate(
      fields.confirmPassword,
      "confirmPassword",
      fields.password || ""
    );
    if (!success) return errors;
  }

  return [];
}
