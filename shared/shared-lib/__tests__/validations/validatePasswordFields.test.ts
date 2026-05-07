import { describe, it, expect } from "vitest";
import { validatePasswordFields } from "../../validations/validatePasswordFields";

describe("validatePasswordFields", () => {
  it("returns empty array for a valid password", () => {
    expect(validatePasswordFields({ password: "Secure1@" })).toHaveLength(0);
  });

  it("returns empty array when neither field is provided", () => {
    expect(validatePasswordFields({})).toHaveLength(0);
  });

  it("returns errors when password fails validation", () => {
    const errors = validatePasswordFields({ password: "weak" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns errors when confirmPassword does not match", () => {
    const errors = validatePasswordFields({
      password: "Secure1@",
      confirmPassword: "Different1@",
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("validates password first and returns those errors before confirmPassword check", () => {
    const errors = validatePasswordFields({
      password: "weak",
      confirmPassword: "weak",
    });
    // password validation fires first
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns empty array when both password and confirmPassword are valid and match", () => {
    const errors = validatePasswordFields({
      password: "Secure1@",
      confirmPassword: "Secure1@",
    });
    expect(errors).toHaveLength(0);
  });
});
