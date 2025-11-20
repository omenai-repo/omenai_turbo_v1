export async function getClientIdentifier(
  request: Request,
  userId?: string
): Promise<string> {
  // 1️⃣ Priority: Rate limit by User ID if authenticated
  // This prevents users from rotating IPs to bypass limits.
  if (userId) {
    return `user:${userId}`;
  }

  const headers = request.headers;
  let ip = "unknown";

  // 2️⃣ Cloudflare headers (most trusted)
  const cfConnectingIP = headers.get("cf-connecting-ip");
  const trueClientIP = headers.get("true-client-ip");

  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    ip = cfConnectingIP;
  } else if (trueClientIP && isValidIP(trueClientIP)) {
    ip = trueClientIP;
  } else {
    // 3️⃣ Fallback headers
    const forwarded = headers.get("x-forwarded-for")?.split(",")[0].trim();
    const xRealIP = headers.get("x-real-ip");

    if (forwarded && isValidIP(forwarded)) ip = forwarded;
    else if (xRealIP && isValidIP(xRealIP)) ip = xRealIP;
  }

  // 4️⃣ Privacy: Hash the IP using Web Crypto API (Edge compatible)
  // If IP is unknown, we bucket them together (safer than failing open, but risky for public APIs)
  const hash = await hashString(ip);

  return `ip:${hash}`;
}

/**
 * Edge-compatible SHA-256 hashing
 */
async function hashString(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Use the global crypto API (standard in Node 18+ and Edge)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // optimization: 64 chars is long, 32 is plenty for rate limiting keys
  return hashHex.slice(0, 32);
}

/**
 * Validation Helper
 */
function isValidIP(ip: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  // A slightly more robust IPv6 regex that handles "::" compression
  const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::1$|^::$/;

  if (ipv4.test(ip)) {
    const parts = ip.split(".").map(Number);
    // Ensure octets are 0-255
    return !parts.some((p) => p < 0 || p > 255);
  }

  return ipv6.test(ip);
}
