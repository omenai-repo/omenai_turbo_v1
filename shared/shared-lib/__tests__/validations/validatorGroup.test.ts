import { describe, it, expect } from "vitest";
import { validate } from "../../validations/validatorGroup";

describe("validate", () => {
  describe("email label", () => {
    it("succeeds for a valid email", () => {
      const result = validate("user@example.com", "email");
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails for an invalid email", () => {
      const result = validate("not-an-email", "email");
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("name label", () => {
    it("succeeds for a valid name", () => {
      const result = validate("John Doe", "name");
      expect(result.success).toBe(true);
    });

    it("fails for a name that is too short", () => {
      const result = validate("Jo", "name");
      expect(result.success).toBe(false);
    });
  });

  describe("password label", () => {
    it("succeeds for a valid password", () => {
      const result = validate("Secure1@", "password");
      expect(result.success).toBe(true);
    });

    it("fails for a weak password", () => {
      const result = validate("weak", "password");
      expect(result.success).toBe(false);
    });
  });

  describe("confirmPassword label", () => {
    it("succeeds when value matches confirm", () => {
      const result = validate("Password1@", "confirmPassword", "Password1@");
      expect(result.success).toBe(true);
    });

    it("fails when value does not match confirm", () => {
      const result = validate("Password1@", "confirmPassword", "Different1@");
      expect(result.success).toBe(false);
    });
  });

  describe("phone label", () => {
    it("succeeds for a valid phone number", () => {
      const result = validate("+12025551234", "phone");
      expect(result.success).toBe(true);
    });

    it("fails for an invalid phone number", () => {
      const result = validate("12025551234", "phone");
      expect(result.success).toBe(false);
    });
  });

  describe("zip label", () => {
    it("succeeds for a valid postal code", () => {
      const result = validate("12345", "zip");
      expect(result.success).toBe(true);
    });

    it("fails for an invalid postal code", () => {
      const result = validate("!!", "zip");
      expect(result.success).toBe(false);
    });
  });

  describe("mapped labels (via checkLabel)", () => {
    it("treats admin label as general validation", () => {
      const result = validate("Some text", "admin");
      expect(result.success).toBe(true);
    });

    it("treats address label as general validation", () => {
      const result = validate("AB", "address");
      expect(result.success).toBe(false);
    });
  });
});
