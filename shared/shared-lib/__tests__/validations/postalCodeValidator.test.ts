import { describe, it, expect } from "vitest";
import { validatePostalCode } from "../../validations/postalCodeValidator";

describe("validatePostalCode", () => {
  it("returns empty array for a valid US ZIP code", () => {
    expect(validatePostalCode("12345")).toHaveLength(0);
  });

  it("returns empty array for a valid UK postal code with space", () => {
    expect(validatePostalCode("SW1A 1AA")).toHaveLength(0);
  });

  it("returns empty array for a code with dashes", () => {
    expect(validatePostalCode("12345-6789")).toHaveLength(0);
  });

  it("returns error for postal code shorter than 3 characters", () => {
    const errors = validatePostalCode("AB");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const errors = validatePostalCode("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when special characters (other than space/dash) are present", () => {
    const errors = validatePostalCode("12345!");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for postal code exceeding 15 characters", () => {
    const errors = validatePostalCode("1234567890123456");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts exactly 3-character postal code", () => {
    expect(validatePostalCode("ABC")).toHaveLength(0);
  });
});
