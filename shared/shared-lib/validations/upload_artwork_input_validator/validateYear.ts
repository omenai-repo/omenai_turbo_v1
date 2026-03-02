import { z } from "zod";

export const validateYear = (value: string): string[] => {
  const schema = z.string();
  const now = new Date();
  const year = now.getFullYear();
  let errors = [];

  // Validate if the value is not blank and is a four-digit number
  if (
    !schema
      .min(4)
      .max(4)
      .regex(/^\d{4}$/)
      .safeParse(value).success
  ) {
    errors.push("Year input should be four digits");
  }

  if (Number(value) > year)
    errors.push("The year input cannot be in the future.");

  return errors;
};
