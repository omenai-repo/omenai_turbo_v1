import { z } from "zod";

export const validatePostalCode = <T>(value: T) => {
  const schema = z.string().regex(/^[A-Za-z0-9\- ]+$/, {
    message:
      "Invalid postal code format. Only letters, numbers, spaces, and dashes are allowed.",
  });

  let errors: string[] = [];

  if (!schema.min(3).max(10).safeParse(value).success) {
    errors.push("Postal code must be between 3 and 10 characters long.");
  }

  if (!schema.safeParse(value).success) {
    errors.push("Invalid postal code format. Please check your input.");
  }

  return errors;
};
