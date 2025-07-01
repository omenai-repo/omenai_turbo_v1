import { NextRequest } from "next/server";

export function shouldSkipMiddleware(
  pathname: string,
  req: NextRequest
): boolean {
  // === STATIC FILES AND ASSETS ===
  // All file extensions (images, scripts, stylesheets, fonts, documents)
  if (
    pathname.match(
      /\.(png|jpg|jpeg|gif|svg|ico|css|js|jsx|ts|tsx|woff|woff2|ttf|eot|otf|webp|avif|pdf|txt|xml|json|map|webmanifest|apk|dmg|exe|zip|tar|gz)$/i
    )
  ) {
    return true;
  }

  // === NEXT.JS INTERNALS ===
  // Next.js internal routes and build artifacts
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/__next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname.startsWith("/__vercel/")
  ) {
    return true;
  }

  // === API AND SERVER ROUTES ===
  // API routes, tRPC, and server functions
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/trpc/") ||
    pathname.startsWith("/.netlify/") ||
    pathname.startsWith("/.vercel/")
  ) {
    return true;
  }

  // === COMMON PUBLIC/META FILES ===
  const publicFiles = [
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
    "/humans.txt",
    "/security.txt",
    "/.well-known/",
    "/sw.js",
    "/service-worker.js",
    "/workbox-",
    "/apple-touch-icon",
    "/browserconfig.xml",
  ];
  if (
    publicFiles.some((file) => pathname.startsWith(file) || pathname === file)
  ) {
    return true;
  }

  // === ASSETS AND PUBLIC FOLDERS ===
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/img/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/artwork/") ||
    pathname.startsWith("/search/") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/artist") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/collections/")
  ) {
    return true;
  }

  // === MONITORING AND ANALYTICS SERVICES ===
  // Highlight.io, Sentry, DataDog, New Relic, etc.
  const monitoringPaths = [
    "/v1/",
    "/v2/",
    "/api/v1/",
    "/api/v2/",
    "highlight-events",
    "/highlight/",
    "/sentry/",
    "/analytics/",
    "/tracking/",
    "/metrics/",
    "/telemetry/",
    "/health",
    "/ping",
    "/status",
    "/ready",
    "/live",
    "/__health",
    "/__ping",
    "/__status",
    "/datadog-",
    "/newrelic-",
    "/bugsnag-",
    "/rollbar-",
  ];
  if (
    monitoringPaths.some(
      (path) => pathname.startsWith(path) || pathname.includes(path)
    )
  ) {
    return true;
  }

  // === DEVELOPMENT AND DEBUGGING ===
  if (
    pathname.startsWith("/__webpack") ||
    pathname.startsWith("/__nextjs") ||
    pathname.startsWith("/hot-reload") ||
    pathname.startsWith("/_error") ||
    pathname.includes("hmr") ||
    pathname.includes("hot-update")
  ) {
    return true;
  }

  // === EXTERNAL SERVICE WEBHOOKS AND CALLBACKS ===
  const webhookPaths = [
    "/webhook/",
    "/webhooks/",
    "/callback/",
    "/callbacks/",
    "/stripe/",
    "/paypal/",
    "/square/",
    "/paddle/",
    "/clerk/",
    "/auth0/",
    "/firebase/",
    "/supabase/",
    "/github/",
    "/gitlab/",
    "/bitbucket/",
    "/slack/",
    "/discord/",
    "/telegram/",
  ];
  if (webhookPaths.some((path) => pathname.startsWith(path))) {
    return true;
  }

  // === SECURITY AND COMPLIANCE ===
  if (
    pathname.startsWith("/.well-known/") ||
    pathname.includes("acme-challenge") ||
    pathname.includes("security") ||
    pathname === "/ads.txt" ||
    pathname === "/app-ads.txt"
  ) {
    return true;
  }

  // === ANY FILE WITH EXTENSION IN ROOT ===
  // Catches files like google_play.png, app-store-badge.svg, etc.
  if (!pathname.includes("/") && pathname.includes(".")) {
    return true;
  }

  // === EXTERNAL REQUESTS DETECTION ===
  const userAgent = req.headers.get("user-agent") || "";

  // Skip bot/crawler requests
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "curl",
    "wget",
    "postman",
  ];
  if (
    botPatterns.some((pattern) => userAgent.toLowerCase().includes(pattern))
  ) {
    return true;
  }

  // Skip monitoring service requests (they often have specific user agents)
  const monitoringAgents = [
    "highlight",
    "sentry",
    "datadog",
    "newrelic",
    "pingdom",
    "uptimerobot",
  ];
  if (
    monitoringAgents.some((agent) => userAgent.toLowerCase().includes(agent))
  ) {
    return true;
  }

  return false;
}
