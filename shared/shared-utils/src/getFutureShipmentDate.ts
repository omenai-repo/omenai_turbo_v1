import { getUTCOffset } from "./getCountryTimezone";
import { isHoliday } from "../../shared-lib/holiday_check/isHoliday";
import { toUTCDate } from "./toUtcDate";

const MAX_ATTEMPTS = 365;
const DEFAULT_TIME = { hours: "09", minutes: "00" };
const FALLBACK_TIMEZONE = "GMT+00:00";

// Helper functions
function validateDays(days: number): void {
  if (days < 0) {
    throw new Error("Days must be non-negative");
  }
}

function validateCountryCode(countryCode: string): void {
  if (!countryCode || typeof countryCode !== "string") {
    throw new Error("Valid country code is required");
  }
}

function validatePickupTime(pickupTime: {
  hours: string;
  minutes: string;
}): void {
  const hours = Number.parseInt(pickupTime.hours);
  const minutes = Number.parseInt(pickupTime.minutes);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid pickup time format");
  }
}

function validateInputs(
  days: number,
  countryCode: string,
  withTime: boolean,
  pickup_earliest_time?: { hours: string; minutes: string }
): void {
  validateDays(days);
  validateCountryCode(countryCode);

  if (withTime && pickup_earliest_time) {
    validatePickupTime(pickup_earliest_time);
  }
}

function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

async function checkIfHoliday(
  date: Date,
  countryCode: string
): Promise<boolean> {
  try {
    return await isHoliday(date, countryCode);
  } catch (error) {
    console.warn(
      `Holiday check failed for ${countryCode} on ${date.toISOString()}`
    );
    return false;
  }
}

async function isBusinessDay(
  date: Date,
  countryCode: string
): Promise<boolean> {
  if (isWeekend(date)) return false;

  const holiday = await checkIfHoliday(date, countryCode);
  return !holiday;
}

async function findNextBusinessDay(
  startDate: Date,
  countryCode: string
): Promise<Date> {
  const date = new Date(startDate);
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    const isValid = await isBusinessDay(date, countryCode);

    if (isValid) {
      return date;
    }

    date.setDate(date.getDate() + 1);
    attempts++;
  }

  throw new Error(
    "Unable to find valid shipment date within reasonable time (365 days)"
  );
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimezone(countryCode: string): string {
  try {
    const timezone = getUTCOffset(countryCode);

    if (!timezone) {
      throw new Error(`No timezone found for country code: ${countryCode}`);
    }

    return timezone;
  } catch (error) {
    console.warn(`Timezone lookup failed for ${countryCode}`);
    return FALLBACK_TIMEZONE;
  }
}

function getPickupTime(pickup_earliest_time?: {
  hours: string;
  minutes: string;
}) {
  return {
    hours: pickup_earliest_time?.hours || DEFAULT_TIME.hours,
    minutes: pickup_earliest_time?.minutes || DEFAULT_TIME.minutes,
  };
}

function formatDateWithTime(
  date: Date,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): string {
  const dateOnly = formatDateOnly(date);
  const timezone = getTimezone(countryCode);
  const time = getPickupTime(pickup_earliest_time);

  return `${dateOnly}T${time.hours}:${time.minutes}:00 ${timezone}`;
}

export async function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): Promise<string> {
  // Validate all inputs
  validateInputs(days, countryCode, withTime, pickup_earliest_time);

  // Calculate initial date
  const initialDate = new Date(toUTCDate(new Date()));
  initialDate.setDate(initialDate.getDate() + days);

  // Find next business day
  const validDate = await findNextBusinessDay(initialDate, countryCode);

  // Format and return result
  if (!withTime) {
    return formatDateOnly(validDate);
  }

  return formatDateWithTime(validDate, countryCode, pickup_earliest_time);
}
