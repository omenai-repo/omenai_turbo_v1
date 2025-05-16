import { differenceInDays } from "date-fns";
import { toUTCDate } from "./toUtcDate";

// Function to check if the subscription expiry date is 7, 3, or 1 day away
export const checkDaysToExpiry = (expiryDateISO: Date): number | null => {
  // Parse ISO date string into a Date object
  const targetDate = toUTCDate(new Date(expiryDateISO));

  // Get the current date
  const today = toUTCDate(new Date());

  // Calculate the difference in days
  const daysLeft = differenceInDays(targetDate, today);

  // Return if it is 7, 3, or 1 day before expiry
  if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
    return daysLeft;
  }

  return null; // No matching days
};
