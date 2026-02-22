import { z } from "zod";

export const validateWeight = (value: string): string[] => {
  const schema = z.string();

  let errors = [];

  // Validate if the value is not blank and follows the weight format
  if (
    !schema
      .regex(/^\d+(\.\d+)?\s*(lbs?)$/i, {
        message: "Invalid weight format",
      })
      .safeParse(value).success
  ) {
    errors.push(
      "Invalid weight detected 🚫. We need real measurements like '5lb' or '25lb', not vibes.",
    );
  }

  return errors;
};
