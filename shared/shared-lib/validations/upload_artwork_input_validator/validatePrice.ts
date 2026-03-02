import { z } from "zod";

export const validatePrice = (value: string): string[] => {
  const errors: string[] = [];

  const trimmed = value.trim();

  if (trimmed === "") return errors;
  // Accept valid numbers, including decimals
  const numericSchema = z.string().regex(/^\d+(\.\d+)?$/, {
    message: "Price value must be in digits",
  });

  const result = numericSchema.safeParse(trimmed);

  if (!result.success) {
    errors.push(result.error.issues[0].message);
  }

  return errors;
};
