import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isSubscriptionExpired } from "../isSubscriptionExpired";

describe("isSubscriptionExpired", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for a date in the past", () => {
    expect(isSubscriptionExpired("2024-06-01T00:00:00Z")).toBe(true);
  });

  it("returns true for yesterday", () => {
    expect(isSubscriptionExpired("2024-06-14T00:00:00Z")).toBe(true);
  });

  it("returns false for today (subscription still valid on expiry day)", () => {
    expect(isSubscriptionExpired("2024-06-15T00:00:00Z")).toBe(false);
  });

  it("returns false for a future date", () => {
    expect(isSubscriptionExpired("2024-12-31T00:00:00Z")).toBe(false);
  });
});
