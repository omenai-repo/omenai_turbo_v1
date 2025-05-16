import { getUTCOffset } from "./getCountryTimezone";
import { isHoliday } from "../../shared-lib/holiday_check/isHoliday";
import { toUTCDate } from "./toUtcDate";
export async function getFutureShipmentDate(
  days: number,
  withTime: boolean,
  countryCode: string,
  pickup_earliest_time?: { hours: string; minutes: string }
): Promise<string> {
  const date = toUTCDate(new Date());
  date.setDate(date.getDate() + days);

  while (true) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const weekend = dayOfWeek === 6 || dayOfWeek === 0;
    const holiday = await isHoliday(date, countryCode);

    if (!weekend && !holiday) break;

    date.setDate(date.getDate() + 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  const timezone = getUTCOffset(countryCode) || "GMT+00:00";

  return `${year}-${month}-${day}T${pickup_earliest_time?.hours}:${pickup_earliest_time?.minutes}:00 ${timezone}`;
}
