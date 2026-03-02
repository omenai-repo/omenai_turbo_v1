import { z } from "zod";

export const validateMeasurement = (value: string): string[] => {
  const schema = z.string();

  let errors = [];

  // Validate if the value is not blank and follows the measurement format
  if (
    !schema
      .regex(/^\d+(\.\d+)?(in)$/, {
        message: "Measurement? Flopped. Try again .",
      })
      .safeParse(value).success
  ) {
    errors.push(
      "Heyyy  — need a proper measurement in inches. No freestyling.",
    );
  }

  return errors;
};
