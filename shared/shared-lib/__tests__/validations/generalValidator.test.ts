import { describe, it, expect } from "vitest";
import { validataGeneralText } from "../../validations/generalValidator";

describe("validataGeneralText", () => {
  it("returns empty array for text with 3+ characters", () => {
    expect(validataGeneralText("hello")).toHaveLength(0);
  });

  it("returns empty array for exactly 3 characters", () => {
    expect(validataGeneralText("abc")).toHaveLength(0);
  });

  it("returns error for text shorter than 3 characters", () => {
    const errors = validataGeneralText("ab");
    expect(errors).toContain("Seems like you left this field blank or it's too short");
  });

  it("returns error for empty string", () => {
    const errors = validataGeneralText("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for single character", () => {
    const errors = validataGeneralText("a");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns empty array for long text", () => {
    expect(validataGeneralText("This is a longer text")).toHaveLength(0);
  });
});
