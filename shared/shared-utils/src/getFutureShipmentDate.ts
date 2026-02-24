import { getUTCOffset } from "./getCountryTimezone";
import { isHoliday } from "../../shared-lib/holiday_check/isHoliday";
import { toUTCDate } from "./toUtcDate";

const MAX_ATTEMPTS = 365;
const DEFAULT_TIME = { hours: "09", minutes: "00" };
const FALLBACK_TIMEZONE = "GMT+00:00";

// ----------------------------------------------------------------------
// VALIDATORS
// ----------------------------------------------------------------------
function validateInputs(
  days: number,
  countryCode: string,
  withTime: boolean,
  pickupEarliestTime?: { hours: string; minutes: string },
): void {
  if (days < 0) {
    throw new Error("Days must be non-negative");
  }
  if (!countryCode || typeof countryCode !== "string") {
    throw new Error("Valid country code is required");
  }

  if (withTime && pickupEarliestTime) {
    const hours = Number.parseInt(pickupEarliestTime.hours, 10);
    const minutes = Number.parseInt(pickupEarliestTime.minutes, 10);

    if (
      Number.isNaN(hours) ||
      hours < 0 ||
      hours > 23 ||
      Number.isNaN(minutes) ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error("Invalid pickup time format");
    }
  }
}

// ----------------------------------------------------------------------
// BUSINESS DAY LOGIC
// ----------------------------------------------------------------------
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

async function isBusinessDay(
  date: Date,
  countryCode: string,
): Promise<boolean> {
  if (isWeekend(date)) return false;

  try {
    const holiday = await isHoliday(date, countryCode);
    return !holiday;
  } catch (error) {
    console.warn(
      `Holiday check failed for ${countryCode} on ${date.toISOString()}`,
    );
    return true; // Fail open: if API fails, assume it's a valid business day to avoid blocking shipments
  }
}

async function findNextBusinessDay(
  startDate: Date,
  countryCode: string,
): Promise<Date> {
  const date = new Date(startDate);
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    if (await isBusinessDay(date, countryCode)) {
      return date;
    }
    date.setDate(date.getDate() + 1);
    attempts++;
  }

  throw new Error(
    "Unable to find valid shipment date within reasonable time (365 days)",
  );
}

// ----------------------------------------------------------------------
// FORMATTING (The Core DHL Fix)
// ----------------------------------------------------------------------
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Ensures the timezone string strictly matches DHL's "GMT+XX:XX" or "GMT-XX:XX" requirement.
 */
function normalizeTimezoneForDHL(rawOffset: string): string {
  const cleanOffset = rawOffset.trim().toUpperCase();

  // If it already perfectly matches "GMT+XX:XX", return it
  if (cleanOffset.startsWith("GMT")) return cleanOffset;

  // If it starts with a sign (+01:00), prepend GMT -> "GMT+01:00"
  if (cleanOffset.startsWith("+") || cleanOffset.startsWith("-")) {
    return `GMT${cleanOffset}`;
  }

  // Fallback catch-all for weird edge cases (e.g., "01:00" -> "GMT+01:00")
  return `GMT+${cleanOffset}`;
}

function getTimezone(countryCode: string): string {
  try {
    const timezone = getUTCOffset(countryCode);
    if (!timezone) {
      throw new Error(`No timezone found for country code: ${countryCode}`);
    }
    return normalizeTimezoneForDHL(timezone);
  } catch (error) {
    console.warn(
      `Timezone lookup failed for ${countryCode}. Defaulting to ${FALLBACK_TIMEZONE}`,
    );
    return FALLBACK_TIMEZONE;
  }
}

function formatDateWithTime(
  date: Date,
  countryCode: string,
  pickupEarliestTime?: { hours: string; minutes: string },
): string {
  const dateOnly = formatDateOnly(date);
  const timezone = getTimezone(countryCode);

  const hours = pickupEarliestTime?.hours || DEFAULT_TIME.hours;
  const minutes = pickupEarliestTime?.minutes || DEFAULT_TIME.minutes;

  // Exact DHL Specification: "YYYY-MM-DDThh:mm:ss GMT+hh:mm"
  return `${dateOnly}T${hours}:${minutes}:00 ${timezone}`;
}

// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------
export async function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string },
): Promise<string> {
  validateInputs(days, countryCode, withTime, pickup_earliest_time);

  const initialDate = new Date(toUTCDate(new Date()));
  initialDate.setDate(initialDate.getDate() + days);

  const validDate = await findNextBusinessDay(initialDate, countryCode);

  if (!withTime) {
    return formatDateOnly(validDate);
  }

  return formatDateWithTime(validDate, countryCode, pickup_earliest_time);
}
