import { addDays } from "date-fns";
import { toUTCDate } from "./toUtcDate";

export function getSubscriptionExpiryDate(
  interval: "monthly" | "yearly",
  start_date?: Date
) {
  const baseDate = start_date ? new Date(start_date) : new Date();

  const daysToAdd = interval === "monthly" ? 30 : 365;

  const futureDate = addDays(baseDate, daysToAdd);

  return toUTCDate(futureDate);
}
