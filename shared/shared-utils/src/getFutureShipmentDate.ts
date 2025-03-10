import { getUTCOffset } from "./getCountryTimezone"; // Import the getUTCOffset function

export function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  // Check if the date falls on a weekend and adjust to the next weekday.
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 6) {
    // If Saturday, add 2 days (to Monday)
    date.setDate(date.getDate() + 2);
  } else if (dayOfWeek === 0) {
    // If Sunday, add 1 day (to Monday)
    date.setDate(date.getDate() + 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  const timezone = getUTCOffset(countryCode) || "GMT+00:00"; // Default to UTC if no offset is found

  return `${year}-${month}-${day}T${pickup_earliest_time?.hours}:${pickup_earliest_time?.minutes}:00 ${timezone}`;
}
