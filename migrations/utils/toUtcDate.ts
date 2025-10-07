/**
 * Converts a Date object or date string to a UTC Date object.
 * @param dateInput - A Date object or a date string.
 * @returns A Date object representing the same instant in UTC.
 */
export function toUTCDate(dateInput: Date | string): Date {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
}
