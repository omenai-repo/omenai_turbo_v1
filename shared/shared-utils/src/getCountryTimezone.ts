const { getTimezones } = require("country-timezone");

export const getUTCOffset = (countryCode: string): string | null => {
  const timezones = getTimezones(countryCode);
  if (!timezones || timezones.length === 0) return null;

  // Pick the first timezone (you can modify to return all)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezones[0],
    timeZoneName: "shortOffset",
  });

  const offset = formatter
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;

  if (!offset) return null;

  // Ensure offset is formatted as "GMT±HH:MM"
  return offset.replace(
    /UTC([+-])(\d{1,2}):?(\d{2})?/,
    (_, sign, hours, minutes = "00") => {
      return `GMT${sign}${hours.padStart(2, "0")}:${minutes}`;
    }
  );
};

// // 🔥 Example Usage
// console.log(getUTCOffset("US")); // "GMT-05:00"
// console.log(getUTCOffset("IN")); // "GMT+05:30"
// console.log(getUTCOffset("NG")); // "GMT+01:00"
// console.log(getUTCOffset("JP")); // "GMT+09:00"
// console.log(getUTCOffset("AU")); // "GMT+11:00"
