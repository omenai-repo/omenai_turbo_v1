import { UserTrackingData } from "@omenai/shared-types";

export function extractUserTrackingData(req: Request): UserTrackingData {
  // 1. Safely extract Vercel's proprietary geo-headers (Works for BOTH Web and Mobile App)
  const ip_address =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown";
  const country = req.headers.get("x-vercel-ip-country") || "Unknown";
  const city = req.headers.get("x-vercel-ip-city") || "Unknown";

  // 2. Extract standard web headers
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "direct";

  // 3. THE MOBILE APP OVERRIDE
  // We check if your native app sent a custom identifier header
  const nativeClient = req.headers.get("x-omenai-client");

  let device_type: "mobile" | "desktop" | "tablet" | "unknown" = "desktop";
  let os = "Unknown";
  let browser = "Unknown";

  if (nativeClient) {
    // If the header exists, we KNOW it's the mobile app. Bypass the messy User-Agent parsing.
    device_type = "mobile"; // You can adjust this if you have a native iPad app later
    browser = "Native App"; // Clearly separates app traffic from Safari/Chrome mobile traffic

    // Simple OS detection based on what the app sends (e.g., "ios" or "android")
    if (nativeClient.toLowerCase().includes("ios")) os = "iOS";
    else if (nativeClient.toLowerCase().includes("android")) os = "Android";
  } else {
    // 4. Standard Web User-Agent Parsing (For website visitors)
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      device_type = "tablet";
    } else if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        userAgent,
      )
    ) {
      device_type = "mobile";
    }

    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
    if (userAgent.indexOf("X11") !== -1) os = "UNIX";
    if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    if (/Android/.test(userAgent)) os = "Android";
    if (/like Mac OS X/.test(userAgent)) os = "iOS";

    if (userAgent.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
    else if (userAgent.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (userAgent.indexOf("Edge") !== -1) browser = "Edge";
  }

  // 5. Return the strictly typed object
  return {
    ip_address: ip_address.split(",")[0].trim(),
    country,
    city,
    device_type,
    os,
    browser,
    referrer: nativeClient ? "app_direct" : referrer, // Tag app traffic clearly
  };
}
