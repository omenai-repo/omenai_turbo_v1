import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
/**
 * Adds a given number of days to the current date.
 * @param days - The number of days to add
 * @returns A new Date object representing the future date
 */
export function addDaysToDate(days: number, target_date?: Date): Date {
  const result = target_date ? new Date(target_date) : new Date();
  result.setDate(result.getDate() + days);
  return toUTCDate(result);
}

export function isArtworkExclusiveDate(target_date: Date) {
  const currentDate = toUTCDate(new Date());
  const exclusivityEndDate = addDaysToDate(90, target_date); // Example: 7 days from now
  return exclusivityEndDate >= currentDate;
}
