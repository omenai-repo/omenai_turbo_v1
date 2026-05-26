import { describe, it, expect } from "vitest";
import { validatePassword } from "../../validations/passwordValidator";

describe("validatePassword", () => {
  it("returns empty array for a valid password", () => {
    expect(validatePassword("Secure1@")).toHaveLength(0);
  });

  it("returns empty array for password with all requirements met", () => {
    expect(validatePassword("StrongP4ss!")).toHaveLength(0);
  });

  it("returns error when password is too short (< 8 chars)", () => {
    const errors = validatePassword("Ab1@");
    expect(errors).toContain("Your password should be between 8 and 16 characters");
  });

  it("returns error when password is too long (> 16 chars)", () => {
    const errors = validatePassword("Abcdefghijk12345@");
    expect(errors).toContain("Your password should be between 8 and 16 characters");
  });

  it("returns error when password has no uppercase letter", () => {
    const errors = validatePassword("alllower1@");
    expect(errors).toContain(
      "Your password should contain at least one lowercase letter, one uppercase letter and one number"
    );
  });

  it("returns error when password has no lowercase letter", () => {
    const errors = validatePassword("ALLUPPER1@");
    expect(errors).toContain(
      "Your password should contain at least one lowercase letter, one uppercase letter and one number"
    );
  });

  it("returns error when password has no digit", () => {
    const errors = validatePassword("NoDigits@A");
    expect(errors).toContain(
      "Your password should contain at least one lowercase letter, one uppercase letter and one number"
    );
  });

  it("returns error when password has no special character", () => {
    const errors = validatePassword("NoSpecial1");
    expect(errors).toContain(
      "At least one special character ( @ # $ % ^ & + = ! ) is required"
    );
  });

  it("returns multiple errors for a password that fails several rules", () => {
    const errors = validatePassword("short");
    expect(errors.length).toBeGreaterThan(1);
  });

  it("accepts password with exactly 8 characters meeting all rules", () => {
    expect(validatePassword("Secure1@")).toHaveLength(0);
  });

  it("accepts password with exactly 16 characters meeting all rules", () => {
    expect(validatePassword("Secure1@Secure1@")).toHaveLength(0);
  });
});
