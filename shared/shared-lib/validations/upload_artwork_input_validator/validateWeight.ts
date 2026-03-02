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
      "Invalid weight format, please use imperial measurement units like '1lb' or '25lbs'",
    );
  }

  return errors;
};
