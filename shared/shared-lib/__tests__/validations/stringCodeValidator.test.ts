import { describe, it, expect } from "vitest";
import { validateStringCode } from "../../validations/stringCodeValidator";

describe("validateStringCode", () => {
  it("returns empty string for a valid 6-character code", () => {
    expect(validateStringCode("123456")).toBe("");
  });

  it("returns empty string for a code longer than 6 characters", () => {
    expect(validateStringCode("ABCDEFG")).toBe("");
  });

  it("returns error string for a code with fewer than 6 characters", () => {
    const error = validateStringCode("12345");
    expect(error).toBe("Code has to be a six-digit value");
  });

  it("returns error string for empty string", () => {
    const error = validateStringCode("");
    expect(error).toBe("Code has to be a six-digit value");
  });

  it("returns empty string for exactly 6 characters", () => {
    expect(validateStringCode("AAAAAA")).toBe("");
  });
});
