import { z } from "zod";

export const validatePrice = (value: string): string[] => {
  let errors = [];

  // Validate if the value contains only digits
  if (!/^\d+$/.test(value)) {
    errors.push("Invalid price format. Please enter numbers only.");
  }

  return errors;
};
