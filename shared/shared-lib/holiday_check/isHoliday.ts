// lib/isHoliday.ts

const holidayCache = new Map<string, boolean>();

export async function isHoliday(
  date: Date,
  countryCode: string
): Promise<boolean> {
  const apiKey = "QQowDk3rKdlhZuyPHQO7aoKk0JWkZpVq";
  if (!apiKey) {
    console.warn("Calendarific API key not set.");
    return false;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS months are 0-based
  const day = date.getDate();

  const cacheKey = `${countryCode}-${year}-${month}-${day}`;
  if (holidayCache.has(cacheKey)) {
    return holidayCache.get(cacheKey)!;
  }

  const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}&month=${month}&day=${day}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Calendarific error:", await response.text());
      holidayCache.set(cacheKey, false);
      return false;
    }

    const data = await response.json();
    const isHoliday = data.response?.holidays?.length > 0;
    holidayCache.set(cacheKey, isHoliday);
    return isHoliday;
  } catch (error) {
    console.error("Error checking holiday:", error);
    holidayCache.set(cacheKey, false);
    return false;
  }
}
