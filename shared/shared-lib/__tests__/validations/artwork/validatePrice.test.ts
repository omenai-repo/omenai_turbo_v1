import { describe, it, expect } from "vitest";
import { validatePrice } from "../../../validations/upload_artwork_input_validator/validatePrice";

describe("validatePrice", () => {
  it("returns empty array for a valid integer price", () => {
    expect(validatePrice("5000")).toHaveLength(0);
  });

  it("returns empty array for a valid decimal price", () => {
    expect(validatePrice("1500.99")).toHaveLength(0);
  });

  it("returns empty array for empty string (price is optional)", () => {
    expect(validatePrice("")).toHaveLength(0);
  });

  it("returns empty array for whitespace-only string (trimmed to empty)", () => {
    expect(validatePrice("   ")).toHaveLength(0);
  });

  it("returns error for price with currency symbol", () => {
    const errors = validatePrice("$500");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for non-numeric text", () => {
    const errors = validatePrice("five hundred");
    expect(errors).toContain("Price value must be in digits");
  });

  it("returns error for alphanumeric input", () => {
    const errors = validatePrice("500abc");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for value with comma separators", () => {
    const errors = validatePrice("1,500");
    expect(errors.length).toBeGreaterThan(0);
  });
});
