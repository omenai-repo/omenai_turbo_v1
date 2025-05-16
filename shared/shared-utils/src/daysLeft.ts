import { toUTCDate } from "./toUtcDate";

export function daysLeft(futureDateStr: Date): number {
  // Parse the input string into a Date object
  const futureDate = toUTCDate(new Date(futureDateStr));
  const now = toUTCDate(new Date());

  // Ensure the future date is actually in the future
  if (futureDate <= now) {
    return 0;
  }

  // Calculate the difference in milliseconds between the two dates
  const timeDiff = futureDate.getTime() - now.getTime();

  // Convert milliseconds to days and round up to include partial days
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft;
}
