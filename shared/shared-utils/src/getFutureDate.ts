export function getFutureDate(dateString: Date, interval: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let newDate: Date;
  if (interval === "monthly") {
    newDate = new Date(year, month + 1, day);
  } else if (interval === "yearly") {
    newDate = new Date(year + 1, month, day);
  } else {
    throw new Error("Invalid interval");
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  return newDate.toLocaleDateString("en-US", options);
}
