import { getUTCOffset } from "./getCountryTimezone"; // Import the getUTCOffset function

export function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  const timezone = getUTCOffset(countryCode) || "GMT+00:00"; // Default to UTC if no offset is found

  return `${year}-${month}-${day}T${pickup_earliest_time?.hours}:${pickup_earliest_time?.minutes}:00 ${timezone}`;
}
