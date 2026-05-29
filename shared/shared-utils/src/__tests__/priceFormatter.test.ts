import { describe, it, expect } from "vitest";
import { formatPrice } from "../priceFormatter";

describe("formatPrice", () => {
  describe("integer prices", () => {
    it("formats a whole number with USD currency", () => {
      expect(formatPrice(1000, "USD")).toBe("$1,000");
    });

    it("formats zero correctly", () => {
      expect(formatPrice(0, "USD")).toBe("$0");
    });

    it("formats a large number with thousands separator", () => {
      expect(formatPrice(1000000, "USD")).toBe("$1,000,000");
    });
  });

  describe("decimal prices", () => {
    it("preserves 1 decimal place", () => {
      expect(formatPrice(1137.5, "USD")).toBe("$1,137.5");
    });

    it("preserves 2 decimal places", () => {
      expect(formatPrice(1137.04, "USD")).toBe("$1,137.04");
    });

    it("rounds more than 2 decimals to 1 decimal place", () => {
      // 1137.123 → Math.round(1137.123 * 10) / 10 = 1137.1
      expect(formatPrice(1137.123, "USD")).toBe("$1,137.1");
    });
  });

  describe("string input", () => {
    it("parses a string price with a currency symbol prefix", () => {
      expect(formatPrice("$1500", "USD")).toBe("$1,500");
    });

    it("parses a numeric string without symbol", () => {
      expect(formatPrice("500", "USD")).toBe("$500");
    });

    it("returns empty string for a non-numeric string", () => {
      expect(formatPrice("abc", "USD")).toBe("");
    });
  });

  describe("currency default", () => {
    it("defaults to USD when no currency is provided", () => {
      expect(formatPrice(500)).toBe("$500");
    });
  });

  describe("unknown currency fallback", () => {
    it("falls back to custom symbol lookup for unrecognised currency codes", () => {
      // An invalid Intl currency code triggers the catch block
      const result = formatPrice(1000, "INVALID_CURRENCY");
      expect(result).toContain("1,000");
    });
  });
});
