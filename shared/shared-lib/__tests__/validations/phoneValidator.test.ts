import { describe, it, expect } from "vitest";
import { validatePhoneNumber } from "../../validations/phoneValidator";

describe("validatePhoneNumber", () => {
  it("returns empty array for a valid US number", () => {
    expect(validatePhoneNumber("+12025551234")).toHaveLength(0);
  });

  it("returns empty array for a valid UK number", () => {
    expect(validatePhoneNumber("+441234567890")).toHaveLength(0);
  });

  it("returns empty array for a 14-digit number with country code", () => {
    expect(validatePhoneNumber("+12345678901234")).toHaveLength(0);
  });

  it("returns error when + prefix is missing", () => {
    const errors = validatePhoneNumber("12025551234");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for number that is too short", () => {
    const errors = validatePhoneNumber("+1234567");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for number with spaces", () => {
    const errors = validatePhoneNumber("+1 202 555 1234");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for number with dashes", () => {
    const errors = validatePhoneNumber("+1-202-555-1234");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const errors = validatePhoneNumber("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when number contains letters", () => {
    const errors = validatePhoneNumber("+1800FLOWERS");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for number that is too long (> 15 digits total)", () => {
    const errors = validatePhoneNumber("+123456789012345678");
    expect(errors.length).toBeGreaterThan(0);
  });
});
