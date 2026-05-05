import { describe, it, expect } from "vitest";
import { ValidationUtils } from "../validator";

describe("ValidationUtils.isValidUKBankDetails", () => {
  it("returns true for a valid 8-digit account and 6-digit sort code", () => {
    expect(ValidationUtils.isValidUKBankDetails("12345678", "123456")).toBe(
      true
    );
  });

  it("accepts dashes in the sort code", () => {
    expect(
      ValidationUtils.isValidUKBankDetails("12345678", "12-34-56")
    ).toBe(true);
  });

  it("accepts spaces in the sort code", () => {
    expect(
      ValidationUtils.isValidUKBankDetails("12345678", "12 34 56")
    ).toBe(true);
  });

  it("rejects a 7-digit account number", () => {
    expect(ValidationUtils.isValidUKBankDetails("1234567", "123456")).toBe(
      false
    );
  });

  it("rejects a 9-digit account number", () => {
    expect(ValidationUtils.isValidUKBankDetails("123456789", "123456")).toBe(
      false
    );
  });

  it("rejects a 5-digit sort code", () => {
    expect(ValidationUtils.isValidUKBankDetails("12345678", "12345")).toBe(
      false
    );
  });

  it("rejects letters in the account number", () => {
    expect(ValidationUtils.isValidUKBankDetails("1234567A", "123456")).toBe(
      false
    );
  });
});

describe("ValidationUtils.isValidIBAN", () => {
  it("returns true for a valid GB IBAN", () => {
    expect(ValidationUtils.isValidIBAN("GB29NWBK60161331926819")).toBe(true);
  });

  it("returns true for a valid DE IBAN", () => {
    expect(ValidationUtils.isValidIBAN("DE89370400440532013000")).toBe(true);
  });

  it("accepts spaces within the IBAN", () => {
    expect(
      ValidationUtils.isValidIBAN("GB29 NWBK 6016 1331 9268 19")
    ).toBe(true);
  });

  it("returns false for an incorrect check-digit", () => {
    expect(ValidationUtils.isValidIBAN("GB00NWBK60161331926819")).toBe(false);
  });

  it("returns false for a string that is too short", () => {
    expect(ValidationUtils.isValidIBAN("GB2")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(ValidationUtils.isValidIBAN("")).toBe(false);
  });
});
