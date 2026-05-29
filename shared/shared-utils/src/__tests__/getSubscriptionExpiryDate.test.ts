import { describe, it, expect } from "vitest";
import { getSubscriptionExpiryDate } from "../getSubscriptionExpiryDate";

// Noon UTC on a mid-month date: ±14h timezone offsets cannot shift the day or month.
const base = new Date("2024-06-15T12:00:00Z");

describe("getSubscriptionExpiryDate", () => {
  describe("fallback path (no months param)", () => {
    it("adds 30 days for monthly interval", () => {
      const result = getSubscriptionExpiryDate("monthly", undefined, base);
      // Jun 15 + 30 days = Jul 15
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(6); // July
      expect(result.getUTCDate()).toBe(15);
    });

    it("adds 365 days for yearly interval", () => {
      const result = getSubscriptionExpiryDate("yearly", undefined, base);
      // Jun 15 2024 + 365 days = Jun 15 2025 (Feb 29 2024 is before our window)
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(5); // June
      expect(result.getUTCDate()).toBe(15);
    });
  });

  describe("whole-month path", () => {
    it("adds the specified number of whole months", () => {
      const result = getSubscriptionExpiryDate("monthly", 3, base);
      // Jun 15 noon UTC + 3 months = Sep 15 noon UTC in any timezone
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(8); // September
      expect(result.getUTCDate()).toBe(15);
    });

    it("adds 12 months (one year)", () => {
      const result = getSubscriptionExpiryDate("yearly", 12, base);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(5); // June
      expect(result.getUTCDate()).toBe(15);
    });
  });

  describe("fractional-month path", () => {
    it("adds 14 days for 0.5 months", () => {
      const result = getSubscriptionExpiryDate("monthly", 0.5, base);
      // 0 whole months + 14 days → Jun 29
      expect(result.getUTCMonth()).toBe(5); // June
      expect(result.getUTCDate()).toBe(29);
    });

    it("throws for an unsupported fractional value (0.25)", () => {
      expect(() =>
        getSubscriptionExpiryDate("monthly", 0.25, base)
      ).toThrow("Unsupported fractional month value");
    });

    it("throws for an unsupported fractional value (0.75)", () => {
      expect(() =>
        getSubscriptionExpiryDate("monthly", 0.75, base)
      ).toThrow("Unsupported fractional month value");
    });
  });
});
