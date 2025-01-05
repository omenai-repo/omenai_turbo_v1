export function daysLeft(futureDateStr: Date): number {
  // Parse the input string into a Date object
  const futureDate = new Date(futureDateStr);

  // Ensure the future date is actually in the future
  if (futureDate <= new Date()) {
    return 0;
  }

  // Calculate the difference in milliseconds between the two dates
  const timeDiff = futureDate.getTime() - new Date().getTime();

  // Convert milliseconds to days and round up to include partial days
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft;
}
