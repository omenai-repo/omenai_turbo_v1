import { describe, it, expect } from "vitest";
import { validateWeight } from "../../../validations/upload_artwork_input_validator/validateWeight";

describe("validateWeight", () => {
  it("accepts singular lb unit", () => {
    expect(validateWeight("1lb")).toHaveLength(0);
  });

  it("accepts plural lbs unit", () => {
    expect(validateWeight("25lbs")).toHaveLength(0);
  });

  it("accepts decimal weight", () => {
    expect(validateWeight("12.5lbs")).toHaveLength(0);
  });

  it("accepts weight with a space before unit", () => {
    expect(validateWeight("10 lbs")).toHaveLength(0);
  });

  it("is case-insensitive for unit", () => {
    expect(validateWeight("5LBS")).toHaveLength(0);
    expect(validateWeight("5Lb")).toHaveLength(0);
  });

  it("returns error for missing unit", () => {
    const errors = validateWeight("25");
    expect(errors).toContain(
      "Invalid weight format, please use imperial measurement units like '1lb' or '25lbs'"
    );
  });

  it("returns error for metric unit (kg)", () => {
    const errors = validateWeight("10kg");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const errors = validateWeight("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for non-numeric weight", () => {
    const errors = validateWeight("tenths lbs");
    expect(errors.length).toBeGreaterThan(0);
  });
});
