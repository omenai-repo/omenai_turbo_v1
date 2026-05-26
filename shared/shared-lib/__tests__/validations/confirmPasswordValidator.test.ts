import { describe, it, expect } from "vitest";
import { validateConfirmPassword } from "../../validations/confirmPasswordValidator";

describe("validateConfirmPassword", () => {
  it("returns empty array when passwords match", () => {
    expect(validateConfirmPassword("Password1@", "Password1@")).toHaveLength(0);
  });

  it("returns error when passwords do not match", () => {
    const errors = validateConfirmPassword("Password1@", "Different1@");
    expect(errors).toContain("Sorry, your passwords do not match. Please try again");
  });

  it("returns error when confirm is undefined", () => {
    const errors = validateConfirmPassword("Password1@", undefined);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when value is empty and confirm is non-empty", () => {
    const errors = validateConfirmPassword("", "SomePassword1@");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("is case-sensitive (different cases do not match)", () => {
    const errors = validateConfirmPassword("password1@", "PASSWORD1@");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns empty array when both are empty strings", () => {
    expect(validateConfirmPassword("", "")).toHaveLength(0);
  });
});
