import { z } from "zod";

export const validatePhoneNumber = <T>(value: T) => {
  const schema = z
    .string()
    .min(8, {
      message: "Phone number is too short.",
    })
    .max(15, {
      message: "Phone number is too long.",
    })
    .regex(/^\+\d{8,14}$/, {
      message:
        "Invalid format. Use format like +1234567890 with no spaces or symbols.",
    });

  const result = schema.safeParse(value);
  return result.success ? [] : [result.error.issues[0].message];
};
