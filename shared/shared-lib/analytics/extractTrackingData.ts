import { UserTrackingData } from "@omenai/shared-types";

const decodeSafe = (str: string | null): string => {
  if (!str) return "Unknown";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

export function extractUserTrackingData(req: Request): UserTrackingData {
  const ip_address =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown";

  const countryCode = req.headers.get("x-vercel-ip-country");
  let country = "Unknown";

  if (countryCode) {
    try {
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      country = regionNames.of(countryCode) || countryCode;
    } catch (error) {
      country = countryCode; // Fallback to the 2-letter code just in case
    }
  }

  const city = decodeSafe(req.headers.get("x-vercel-ip-city"));

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
    device_type = "mobile";
    browser = "Native App";

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

export const enrichRegistrationTracking = (
  user: any,
  request: Request,
  Model: any,
) => {
  const tracking = user.registeration_tracking || {};

  // If the country is Unknown, it's a legacy account that needs enrichment
  const needsEnrichment = !tracking.country || tracking.country === "Unknown";

  if (needsEnrichment) {
    // 1. Sniff Vercel Edge Headers for Location & IP
    const ip_address =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    // ── Safely convert Alpha-2 code (e.g., "NG") to Full Name (e.g., "Nigeria") ──
    const countryCode = request.headers.get("x-vercel-ip-country");
    let country = "Unknown";

    if (countryCode) {
      try {
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        country = regionNames.of(countryCode) || countryCode;
      } catch (error) {
        country = countryCode; // Fallback to the 2-letter code just in case
      }
    }

    // ── NEW: Safely decode the city header using the shared helper ──
    const city = decodeSafe(request.headers.get("x-vercel-ip-city"));

    // 2. Parse User-Agent for Device, OS, and Browser
    const userAgent = request.headers.get("User-Agent") || "";

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
    const device_type = isMobile ? "Mobile" : "Desktop";

    let os = "Unknown";
    if (/Windows/i.test(userAgent)) os = "Windows";
    else if (/Mac/i.test(userAgent)) os = "MacOS";
    else if (/Linux/i.test(userAgent)) os = "Linux";
    else if (/Android/i.test(userAgent)) os = "Android";
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = "iOS";

    let browser = "Unknown";
    if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent))
      browser = "Chrome";
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent))
      browser = "Safari";
    else if (/Firefox/i.test(userAgent)) browser = "Firefox";
    else if (/Edge|Edg/i.test(userAgent)) browser = "Edge";

    // 3. Fire-and-Forget Database Update
    Model.updateOne(
      { _id: user._id },
      {
        $set: {
          "registeration_tracking.ip_address": ip_address,
          "registeration_tracking.country": country,
          "registeration_tracking.city": city,
          "registeration_tracking.device_type": device_type,
          "registeration_tracking.os": os,
          "registeration_tracking.browser": browser,
          "registeration_tracking.referrer":
            tracking.referrer || "legacy_backfill",
        },
      },
    ).catch((err: any) =>
      console.error("Silent Enrichment Failed:", err.message),
    );
  }
};
