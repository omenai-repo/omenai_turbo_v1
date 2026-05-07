import { describe, it, expect } from "vitest";
import { validateYear } from "../../../validations/upload_artwork_input_validator/validateYear";

const CURRENT_YEAR = new Date().getFullYear();

describe("validateYear", () => {
  it("returns empty array for a valid 4-digit year in the past", () => {
    expect(validateYear("1990")).toHaveLength(0);
  });

  it("returns empty array for the current year", () => {
    expect(validateYear(String(CURRENT_YEAR))).toHaveLength(0);
  });

  it("returns error for a year in the future", () => {
    const errors = validateYear(String(CURRENT_YEAR + 1));
    expect(errors).toContain("The year input cannot be in the future.");
  });

  it("returns error for a 3-digit year", () => {
    const errors = validateYear("199");
    expect(errors).toContain("Year input should be four digits");
  });

  it("returns error for a 5-digit year", () => {
    const errors = validateYear("20241");
    expect(errors).toContain("Year input should be four digits");
  });

  it("returns error for empty string", () => {
    const errors = validateYear("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for non-numeric characters", () => {
    const errors = validateYear("20ab");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for year with a decimal point", () => {
    const errors = validateYear("2020.5");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("is valid for year 1000 (earliest plausible artwork)", () => {
    expect(validateYear("1000")).toHaveLength(0);
  });
});
