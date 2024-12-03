export function daysElapsedSince(isoDateString: Date): number {
  // Parse the input ISO date string into a Date object
  const inputDate = new Date(isoDateString);

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDiff = currentDate.getTime() - inputDate.getTime();

  // Convert milliseconds to days
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}
