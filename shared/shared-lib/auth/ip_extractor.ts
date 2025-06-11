export function getClientIP(request: Request): string {
  // Reorder headers with Cloudflare priority when using Cloudflare
  const headers = [
    "cf-connecting-ip", // Cloudflare - MOST RELIABLE when configured
    "true-client-ip", // Cloudflare Enterprise
    "x-forwarded-for", // Most common (but can be spoofed)
    "x-real-ip", // Nginx proxy
    "x-client-ip", // Apache
    "x-vercel-forwarded-for", // Vercel specific
    "x-forwarded", // General forwarded header
    "x-cluster-client-ip", // Cluster environments
    "forwarded-for", // RFC 7239
    "forwarded", // RFC 7239
  ];

  // Check each header
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      // Take the first one (the original client)
      const ip = value.split(",")[0].trim();

      // Validate IP format
      if (isValidIP(ip)) {
        console.log(`IP found via ${header}: ${ip}`);
        return ip;
      }
    }
  }

  // If no headers found, try to extract from URL (edge case)
  try {
    const url = new URL(request.url);
    if (url.hostname && url.hostname !== "localhost") {
      return url.hostname;
    }
  } catch {
    // URL parsing failed, continue to fallback
  }

  // Final fallback
  console.warn("No valid IP found, using fallback");
  return "unknown";
}

/**
 * Enhanced IP validation with better IPv6 support
 */
function isValidIP(ip: string): boolean {
  console.log(`Validating IP: ${ip}`);

  // Check for IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

  // Enhanced IPv6 regex (covers more cases)
  const ipv6Regex =
    /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::1$|^::|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  // Check for private/local IPs
  const privateIPRegex =
    /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|fc00:|fe80:)/;

  const isIPv4 = ipv4Regex.test(ip);
  const isIPv6 = ipv6Regex.test(ip);

  if (!isIPv4 && !isIPv6) {
    console.log(`Invalid IP format: ${ip}`);
    return false;
  }

  // Additional IPv4 validation - check ranges
  if (isIPv4) {
    const parts = ip.split(".").map((num) => parseInt(num, 10));
    if (parts.some((part) => part < 0 || part > 255)) {
      console.log(`IPv4 out of range: ${ip}`);
      return false;
    }
  }

  // Option to exclude private IPs (uncomment if needed)
  if (privateIPRegex.test(ip)) {
    console.log(`Private IP detected: ${ip}`);
    // For rate limiting, you might want to still use private IPs in dev
    return process.env.NODE_ENV === "development" || !isProduction();
  }

  return true;
}

/**
 * Production environment check
 */
function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "production"
  );
}

/**
 * Enhanced version with Cloudflare-specific debugging
 */
export function getClientIPWithCloudflareMetadata(request: Request): {
  ip: string;
  source: string;
  isCloudflare: boolean;
  isProxy: boolean;
  country?: string;
  originalHeaders: Record<string, string>;
} {
  const headerMap: Record<string, string> = {};

  // Collect Cloudflare and other relevant headers
  const relevantHeaders = [
    "cf-connecting-ip",
    "cf-ipcountry", // Cloudflare country code
    "cf-ray", // Cloudflare request ID
    "cf-visitor", // Cloudflare visitor info
    "true-client-ip",
    "x-forwarded-for",
    "x-real-ip",
    "x-vercel-forwarded-for",
    "user-agent",
  ];

  relevantHeaders.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      headerMap[header] = value;
    }
  });

  let ip = "unknown";
  let source = "fallback";
  let isProxy = false;

  // Check if request is coming through Cloudflare
  const isCloudflare = !!(headerMap["cf-ray"] || headerMap["cf-connecting-ip"]);
  const country = headerMap["cf-ipcountry"];

  // Prioritize Cloudflare headers if available
  if (isCloudflare) {
    const cfIP = headerMap["cf-connecting-ip"] || headerMap["true-client-ip"];
    if (cfIP && isValidIP(cfIP)) {
      ip = cfIP;
      source = headerMap["cf-connecting-ip"]
        ? "cf-connecting-ip"
        : "true-client-ip";
    }
  }

  // Fallback to other headers if Cloudflare not available
  if (ip === "unknown") {
    const forwardedFor = headerMap["x-forwarded-for"];
    if (forwardedFor) {
      const ips = forwardedFor.split(",").map((ip) => ip.trim());
      if (isValidIP(ips[0])) {
        ip = ips[0];
        source = "x-forwarded-for";
        isProxy = ips.length > 1;
      }
    }
  }

  // Check remaining headers
  if (ip === "unknown") {
    const otherHeaders = ["x-real-ip", "x-client-ip", "x-vercel-forwarded-for"];

    for (const header of otherHeaders) {
      const value = headerMap[header];
      if (value && isValidIP(value)) {
        ip = value;
        source = header;
        break;
      }
    }
  }

  return {
    ip,
    source,
    isCloudflare,
    isProxy,
    country,
    originalHeaders: headerMap,
  };
}

// Rate limiting helper that works with your IP extractor
export function createRateLimitKey(
  request: Request,
  route: string,
  additionalIdentifiers?: string[]
): string {
  const ipData = getClientIPWithCloudflareMetadata(request);
  const baseKey = `rate_limit:${route}:${ipData.ip}`;

  if (additionalIdentifiers?.length) {
    return `${baseKey}:${additionalIdentifiers.join(":")}`;
  }

  return baseKey;
}

// Usage example for debugging
export function debugIPDetection(request: Request): void {
  if (process.env.NODE_ENV === "development") {
    const ipData = getClientIPWithCloudflareMetadata(request);
    console.log("🔍 IP Detection Debug:", {
      detectedIP: ipData.ip,
      source: ipData.source,
      isCloudflare: ipData.isCloudflare,
      country: ipData.country,
      headers: ipData.originalHeaders,
    });
  }
}
