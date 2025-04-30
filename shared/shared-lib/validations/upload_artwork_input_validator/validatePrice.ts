import { z } from "zod";

export const validatePrice = (value: string): string[] => {
  let errors = [];

  // Validate if the value contains only digits
  if (!/^\d+$/.test(value)) {
    errors.push("We need straight-up digits 🔢, not whatever that was.");
  }

  return errors;
};
