import { addDays, addMonths } from "date-fns";
import { toUTCDate } from "./toUtcDate";

export function getSubscriptionExpiryDate(
  interval: "monthly" | "yearly",
  months?: number,
  start_date?: Date,
) {
  const baseDate = start_date ? new Date(start_date) : new Date();

  // If a specific number of months is provided, calculate based on that
  if (months) {
    const futureDate = addMonths(baseDate, months);
    return toUTCDate(futureDate);
  }

  // Otherwise, fall back to the standard fixed-day logic
  const daysToAdd = interval === "monthly" ? 30 : 365;
  const futureDate = addDays(baseDate, daysToAdd);

  return toUTCDate(futureDate);
}
