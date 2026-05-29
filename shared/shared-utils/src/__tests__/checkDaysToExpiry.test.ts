import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkDaysToExpiry } from "../checkDaysToExpiry";

describe("checkDaysToExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 7 when the expiry is exactly 7 days away", () => {
    expect(checkDaysToExpiry(new Date("2024-06-22T00:00:00Z"))).toBe(7);
  });

  it("returns 3 when the expiry is exactly 3 days away", () => {
    expect(checkDaysToExpiry(new Date("2024-06-18T00:00:00Z"))).toBe(3);
  });

  it("returns 1 when the expiry is exactly 1 day away", () => {
    expect(checkDaysToExpiry(new Date("2024-06-16T00:00:00Z"))).toBe(1);
  });

  it("returns null for 2 days away (not a notification day)", () => {
    expect(checkDaysToExpiry(new Date("2024-06-17T00:00:00Z"))).toBeNull();
  });

  it("returns null for 0 days (already expired / same day)", () => {
    expect(checkDaysToExpiry(new Date("2024-06-15T00:00:00Z"))).toBeNull();
  });

  it("returns null for 30 days away", () => {
    expect(checkDaysToExpiry(new Date("2024-07-15T00:00:00Z"))).toBeNull();
  });
});
