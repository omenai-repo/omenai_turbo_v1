export function isExpiredByDateLength(dateString: Date): boolean {
  // Parse the input date string into a Date object
  const inputDate: Date = new Date(dateString);

  // Get the current date
  const currentDate: Date = new Date();

  // Calculate the difference in milliseconds
  const differenceInMs: number = currentDate.getTime() - inputDate.getTime();

  // Convert milliseconds to hours
  const differenceInHours: number = differenceInMs / (1000 * 60 * 60);

  // Check if the difference is 24, 48, or 72 hours
  if (differenceInHours > 24) return true;
  else return false;
}
