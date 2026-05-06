import { describe, it, expect } from "vitest";
import { extractUserTrackingData } from "../../analytics/extractTrackingData";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com", { headers });
}

describe("extractUserTrackingData", () => {
  describe("IP extraction", () => {
    it("returns Unknown when no IP headers are present", () => {
      expect(extractUserTrackingData(makeRequest()).ip_address).toBe("Unknown");
    });

    it("extracts IP from x-forwarded-for (takes the first in the list)", () => {
      const data = extractUserTrackingData(
        makeRequest({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })
      );
      expect(data.ip_address).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip when x-forwarded-for is absent", () => {
      const data = extractUserTrackingData(makeRequest({ "x-real-ip": "5.6.7.8" }));
      expect(data.ip_address).toBe("5.6.7.8");
    });
  });

  describe("country resolution", () => {
    it("returns Unknown when country header is absent", () => {
      expect(extractUserTrackingData(makeRequest()).country).toBe("Unknown");
    });

    it("resolves US alpha-2 code to full country name", () => {
      const data = extractUserTrackingData(makeRequest({ "x-vercel-ip-country": "US" }));
      expect(data.country).toBe("United States");
    });

    it("resolves NG to Nigeria", () => {
      const data = extractUserTrackingData(makeRequest({ "x-vercel-ip-country": "NG" }));
      expect(data.country).toBe("Nigeria");
    });
  });

  describe("city extraction", () => {
    it("returns Unknown when city header is absent", () => {
      expect(extractUserTrackingData(makeRequest()).city).toBe("Unknown");
    });

    it("decodes URL-encoded city name", () => {
      const data = extractUserTrackingData(makeRequest({ "x-vercel-ip-city": "New%20York" }));
      expect(data.city).toBe("New York");
    });

    it("returns raw city name when not encoded", () => {
      const data = extractUserTrackingData(makeRequest({ "x-vercel-ip-city": "London" }));
      expect(data.city).toBe("London");
    });
  });

  describe("native mobile client (x-omenai-client header)", () => {
    it("sets device_type to mobile when x-omenai-client is present", () => {
      const data = extractUserTrackingData(makeRequest({ "x-omenai-client": "ios/1.0.0" }));
      expect(data.device_type).toBe("mobile");
    });

    it("sets browser to Native App for native clients", () => {
      const data = extractUserTrackingData(makeRequest({ "x-omenai-client": "android/2.0" }));
      expect(data.browser).toBe("Native App");
    });

    it("detects iOS from x-omenai-client header", () => {
      const data = extractUserTrackingData(makeRequest({ "x-omenai-client": "ios/1.0.0" }));
      expect(data.os).toBe("iOS");
    });

    it("detects Android from x-omenai-client header", () => {
      const data = extractUserTrackingData(makeRequest({ "x-omenai-client": "android/2.0" }));
      expect(data.os).toBe("Android");
    });

    it("sets referrer to app_direct for native clients", () => {
      const data = extractUserTrackingData(makeRequest({ "x-omenai-client": "ios/1.0.0" }));
      expect(data.referrer).toBe("app_direct");
    });
  });

  describe("web user-agent parsing", () => {
    const CHROME_WINDOWS_UA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const FIREFOX_LINUX_UA =
      "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
    const IPHONE_UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
    const IPAD_UA =
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

    it("identifies Windows OS from Chrome UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": CHROME_WINDOWS_UA }));
      expect(data.os).toBe("Windows");
    });

    it("identifies Chrome browser from Chrome UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": CHROME_WINDOWS_UA }));
      expect(data.browser).toBe("Chrome");
    });

    it("identifies desktop device from Chrome UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": CHROME_WINDOWS_UA }));
      expect(data.device_type).toBe("desktop");
    });

    it("identifies Firefox browser from Firefox UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": FIREFOX_LINUX_UA }));
      expect(data.browser).toBe("Firefox");
    });

    it("identifies Linux OS from Firefox UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": FIREFOX_LINUX_UA }));
      expect(data.os).toBe("Linux");
    });

    it("identifies mobile device from iPhone UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": IPHONE_UA }));
      expect(data.device_type).toBe("mobile");
    });

    it("identifies tablet device from iPad UA", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": IPAD_UA }));
      expect(data.device_type).toBe("tablet");
    });

    it("sets referrer to direct when referer header is absent", () => {
      const data = extractUserTrackingData(makeRequest({ "user-agent": CHROME_WINDOWS_UA }));
      expect(data.referrer).toBe("direct");
    });

    it("extracts referrer from referer header", () => {
      const data = extractUserTrackingData(
        makeRequest({ "user-agent": CHROME_WINDOWS_UA, referer: "https://google.com" })
      );
      expect(data.referrer).toBe("https://google.com");
    });
  });

  describe("return shape", () => {
    it("always returns all required fields", () => {
      const data = extractUserTrackingData(makeRequest());
      expect(data).toHaveProperty("ip_address");
      expect(data).toHaveProperty("country");
      expect(data).toHaveProperty("city");
      expect(data).toHaveProperty("device_type");
      expect(data).toHaveProperty("os");
      expect(data).toHaveProperty("browser");
      expect(data).toHaveProperty("referrer");
    });
  });
});
