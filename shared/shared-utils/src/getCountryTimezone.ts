const { getTimezones } = require("country-timezone");

export const getUTCOffset = (countryCode: string): string | null => {
  const timezones = getTimezones(countryCode);
  if (!timezones || timezones.length === 0) return null;

  const timeZone = timezones[0];
  const now = new Date();

  try {
    // Get the offset in minutes from UTC
    const localTime = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    const utcTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    const [localHour, localMinute] = localTime.split(":").map(Number);
    const [utcHour, utcMinute] = utcTime.split(":").map(Number);

    const totalOffsetMinutes =
      (localHour - utcHour) * 60 + (localMinute - utcMinute);

    // Handle negative wraparound (e.g. UTC = 23:00, local = 01:00 next day)
    const normalizedOffset = ((totalOffsetMinutes + 720) % 1440) - 720; // Normalize to [-720, +720]

    const sign = normalizedOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(normalizedOffset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const minutes = String(absOffset % 60).padStart(2, "0");

    return `GMT${sign}${hours}:${minutes}`;
  } catch (e) {
    return null;
  }
};
