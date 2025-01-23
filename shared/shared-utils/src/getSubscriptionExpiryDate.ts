import { add } from "date-fns";

export function getSubscriptionExpiryDate(
  interval: "monthly" | "yearly",
  start_date?: Date
) {
  const currentDate = new Date();
  const futureDate = add(
    start_date ? start_date : currentDate,
    interval === "monthly" ? { months: 1 } : { years: 1 }
  );
  return futureDate;
}

// Example usage:
const currentDate = new Date();
const monthlyExpiry = getSubscriptionExpiryDate("monthly");
const yearlyExpiry = getSubscriptionExpiryDate("yearly");
