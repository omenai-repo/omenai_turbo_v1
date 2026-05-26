import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { daysElapsedSince } from "../daysElapsedSince";

describe("daysElapsedSince", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the number of full days elapsed since a past date", () => {
    expect(daysElapsedSince(new Date("2024-06-10T00:00:00Z"))).toBe(5);
  });

  it("returns 0 when the date is today", () => {
    expect(daysElapsedSince(new Date("2024-06-15T00:00:00Z"))).toBe(0);
  });

  it("returns a negative number for a future date", () => {
    expect(daysElapsedSince(new Date("2024-06-17T00:00:00Z"))).toBe(-2);
  });

  it("floors partial days (does not round up)", () => {
    // 1.5 days ago → Math.floor(1.5) = 1
    expect(daysElapsedSince(new Date("2024-06-13T12:00:00Z"))).toBe(1);
  });
});
