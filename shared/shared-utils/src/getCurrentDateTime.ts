export function getFormattedDateTime(): string {
  const now = new Date();

  // Get the day and month for formatting
  const day = now.getDate();
  const month = now.getMonth(); // Month is zero-indexed (January = 0)

  // Get day suffix (st, nd, rd, th)
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) {
    suffix = "st";
  } else if (day % 10 === 2 && day !== 12) {
    suffix = "nd";
  } else if (day % 10 === 3 && day !== 13) {
    suffix = "rd";
  }

  // Format year, month names can be retrieved from an array for localization
  const year = now.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month];

  // Format hours (12-hour format), minutes, and AM/PM
  const hours = now.getHours() % 12 || 12; // Convert to 12-hour clock
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const period = now.getHours() < 12 ? "AM" : "PM";

  // Construct the formatted string
  return `${day}${suffix} ${monthName}, ${year}, ${hours}:${minutes} ${period}`;
}
