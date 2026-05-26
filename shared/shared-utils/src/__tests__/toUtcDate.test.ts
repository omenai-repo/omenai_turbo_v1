import { describe, it, expect } from "vitest";
import { toUTCDate } from "../toUtcDate";

describe("toUTCDate", () => {
  it("accepts a Date object and returns a Date instance", () => {
    expect(toUTCDate(new Date("2024-01-15T12:00:00Z"))).toBeInstanceOf(Date);
  });

  it("preserves the UTC date components from a Date input", () => {
    const result = toUTCDate(new Date("2024-01-15T12:00:00Z"));
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(0); // January
    expect(result.getUTCDate()).toBe(15);
  });

  it("preserves UTC time components", () => {
    const result = toUTCDate(new Date("2024-03-20T14:30:45.500Z"));
    expect(result.getUTCHours()).toBe(14);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(45);
    expect(result.getUTCMilliseconds()).toBe(500);
  });

  it("accepts a date string and returns the correct UTC date", () => {
    const result = toUTCDate("2024-06-01T00:00:00Z");
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(5); // June
    expect(result.getUTCDate()).toBe(1);
  });

  it("produces the same timestamp for equivalent Date and string inputs", () => {
    const dateInput = toUTCDate(new Date("2024-09-10T08:00:00Z"));
    const stringInput = toUTCDate("2024-09-10T08:00:00Z");
    expect(dateInput.getTime()).toBe(stringInput.getTime());
  });
});
