import { describe, it, expect } from "vitest";
import { validateMeasurement } from "../../../validations/upload_artwork_input_validator/validateMeasurement";

describe("validateMeasurement", () => {
  it("returns empty array for a whole-number measurement in inches", () => {
    expect(validateMeasurement("24in")).toHaveLength(0);
  });

  it("returns empty array for a decimal measurement in inches", () => {
    expect(validateMeasurement("12.5in")).toHaveLength(0);
  });

  it("returns error when unit is missing", () => {
    const errors = validateMeasurement("24");
    expect(errors).toContain("All measurements should be labeled in inches (in)");
  });

  it("returns error for wrong unit (cm)", () => {
    const errors = validateMeasurement("24cm");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const errors = validateMeasurement("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when there is a space before the unit", () => {
    const errors = validateMeasurement("24 in");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for non-numeric value", () => {
    const errors = validateMeasurement("twoinchesin");
    expect(errors.length).toBeGreaterThan(0);
  });
});
