import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { daysLeft } from "../daysLeft";

describe("daysLeft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the number of full days until a future date", () => {
    expect(daysLeft(new Date("2024-06-17T00:00:00Z"))).toBe(2);
  });

  it("rounds a partial day up to the next whole day", () => {
    // 12 hours remaining → Math.ceil(0.5) = 1
    expect(daysLeft(new Date("2024-06-15T12:00:00Z"))).toBe(1);
  });

  it("returns 0 for a past date", () => {
    expect(daysLeft(new Date("2024-06-10T00:00:00Z"))).toBe(0);
  });

  it("returns 0 for the current moment (not in the future)", () => {
    expect(daysLeft(new Date("2024-06-15T00:00:00Z"))).toBe(0);
  });

  it("handles a date far in the future", () => {
    // Jun 15 2024 → Jun 15 2025 spans no leap-day, so exactly 365 days
    expect(daysLeft(new Date("2025-06-15T00:00:00Z"))).toBe(365);
  });
});
