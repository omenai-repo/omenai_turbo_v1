import { z } from "zod";

export const validateWeight = (value: string): string[] => {
  const schema = z.string();

  let errors = [];

  // Validate if the value is not blank and follows the weight format
  if (
    !schema
      .regex(/^\d+(\.\d+)?(kg|g)$/, {
        message: "Invalid weight format",
      })
      .safeParse(value).success
  ) {
    errors.push(
      "Invalid weight detected 🚫. We need real measurements like '5kg' or '25g', not vibes."
    );
  }

  return errors;
};
