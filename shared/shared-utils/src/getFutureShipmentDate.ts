import { getUTCOffset } from "./getCountryTimezone";
import { isHoliday } from "../../shared-lib/holiday_check/isHoliday";
import { toUTCDate } from "./toUtcDate";

export async function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): Promise<string> {
  // Input validation
  if (days < 0) {
    throw new Error("Days must be non-negative");
  }
  if (!countryCode || typeof countryCode !== "string") {
    throw new Error("Valid country code is required");
  }
  if (withTime && pickup_earliest_time) {
    const hours = parseInt(pickup_earliest_time.hours);
    const minutes = parseInt(pickup_earliest_time.minutes);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid pickup time format");
    }
  }

  // Create a new date object to avoid mutation
  const date = new Date(toUTCDate(new Date()));
  date.setDate(date.getDate() + days);

  let attempts = 0;
  const maxAttempts = 365; // Prevent infinite loops

  while (attempts < maxAttempts) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const weekend = dayOfWeek === 6 || dayOfWeek === 0;

    let holiday = false;
    try {
      holiday = await isHoliday(date, countryCode);
    } catch (error) {
      // Log warning but continue - assume not a holiday if check fails
      console.warn(
        `Holiday check failed for ${countryCode} on ${date.toISOString()}`
      );
      holiday = false;
    }

    if (!weekend && !holiday) {
      break;
    }

    date.setDate(date.getDate() + 1);
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error(
      "Unable to find valid shipment date within reasonable time (365 days)"
    );
  }

  // Format date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Return date only format
  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  // Handle timezone for time format
  let timezone;
  try {
    timezone = getUTCOffset(countryCode);
    if (!timezone) {
      throw new Error(`No timezone found for country code: ${countryCode}`);
    }
  } catch (error) {
    console.warn(`Timezone lookup failed for ${countryCode}`);
    timezone = "GMT+00:00"; // Fallback to UTC
  }

  // Use default time if not provided
  const hours = pickup_earliest_time?.hours || "09";
  const minutes = pickup_earliest_time?.minutes || "00";

  return `${year}-${month}-${day}T${hours}:${minutes}:00 GMT+01:00`;
}
