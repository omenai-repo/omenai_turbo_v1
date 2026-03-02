import { z } from "zod";

export const validateMeasurement = (value: string): string[] => {
  const schema = z.string();

  let errors = [];

  // Validate if the value is not blank and follows the measurement format
  if (
    !schema
      .regex(/^\d+(\.\d+)?(in)$/, {
        message: "Invalid measurement unit, please try again",
      })
      .safeParse(value).success
  ) {
    errors.push("All measurements should be labeled in inches (in)");
  }

  return errors;
};
