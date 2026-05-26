import { describe, it, expect } from "vitest";
import { validateEmail } from "../../validations/emailValidator";

describe("validateEmail", () => {
  it("returns empty array for a valid email", () => {
    expect(validateEmail("user@example.com")).toHaveLength(0);
  });

  it("returns empty array for email with subdomain", () => {
    expect(validateEmail("user@mail.example.com")).toHaveLength(0);
  });

  it("returns error for email missing @", () => {
    const errors = validateEmail("userexample.com");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for email missing domain", () => {
    const errors = validateEmail("user@");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for email missing local part", () => {
    const errors = validateEmail("@example.com");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const errors = validateEmail("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for plain text (no email structure)", () => {
    const errors = validateEmail("notanemail");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("error message includes the invalid email value", () => {
    const badEmail = "bad-email";
    const errors = validateEmail(badEmail);
    expect(errors[0]).toContain(badEmail);
  });
});
