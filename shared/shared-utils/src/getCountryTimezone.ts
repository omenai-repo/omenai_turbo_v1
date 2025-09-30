const { getTimezones } = require("country-timezone");

export const getUTCOffset = (countryCode: string): string | null => {
  const timezones = getTimezones(countryCode);
  if (!timezones || timezones.length === 0) return null;

  const timeZone = timezones[0];
  const now = new Date();

  try {
    const local = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);

    const utc = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);

    const localHour = parseInt(
      local.find((p) => p.type === "hour")?.value || "0",
      10
    );
    const localMinute = parseInt(
      local.find((p) => p.type === "minute")?.value || "0",
      10
    );

    const utcHour = parseInt(
      utc.find((p) => p.type === "hour")?.value || "0",
      10
    );
    const utcMinute = parseInt(
      utc.find((p) => p.type === "minute")?.value || "0",
      10
    );

    const offsetMinutes =
      (localHour - utcHour) * 60 + (localMinute - utcMinute);

    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, "0");
    const minutes = String(abs % 60).padStart(2, "0");

    return `${sign}${hours}:${minutes}`;
  } catch {
    return null;
  }
};
