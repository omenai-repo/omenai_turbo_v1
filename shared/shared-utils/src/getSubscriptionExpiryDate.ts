import { addDays, addMonths } from "date-fns";
import { toUTCDate } from "./toUtcDate";

export function getSubscriptionExpiryDate(
  interval: "monthly" | "yearly",
  months?: number,
  start_date?: Date,
) {
  const baseDate = start_date ? new Date(start_date) : new Date();

  if (months !== undefined) {
    const wholeMonths = Math.floor(months);
    const fractionalMonths = months - wholeMonths;

    let futureDate = addMonths(baseDate, wholeMonths);

    // Handle fractional months explicitly
    if (fractionalMonths > 0) {
      let daysToAdd = 0;

      // Force exact business rule
      if (Math.abs(fractionalMonths - 0.5) < 1e-6) {
        daysToAdd = 14;
      } else {
        throw new Error(
          `Unsupported fractional month value: ${months}. Only 0.5 is allowed.`,
        );
      }

      futureDate = addDays(futureDate, daysToAdd);
    }

    return toUTCDate(futureDate);
  }

  // fallback logic
  const daysToAdd = interval === "monthly" ? 30 : 365;
  return toUTCDate(addDays(baseDate, daysToAdd));
}
