import { describe, it, expect } from "vitest";
import { getCardType } from "../cardTypeDetection";

describe("getCardType", () => {
  describe("Visa", () => {
    it("detects a 13-digit Visa card", () => {
      expect(getCardType("4111111111111")).toBe("visa");
    });

    it("detects a 16-digit Visa card", () => {
      expect(getCardType("4111111111111111")).toBe("visa");
    });
  });

  describe("Mastercard", () => {
    it("detects a Mastercard starting with 51", () => {
      expect(getCardType("5100000000000000")).toBe("mastercard");
    });

    it("detects a Mastercard starting with 55", () => {
      expect(getCardType("5500000000000000")).toBe("mastercard");
    });
  });

  describe("Amex", () => {
    it("detects an Amex card starting with 34", () => {
      expect(getCardType("341111111111111")).toBe("amex");
    });

    it("detects an Amex card starting with 37", () => {
      expect(getCardType("371111111111111")).toBe("amex");
    });
  });

  describe("Verve", () => {
    it("detects a Verve card", () => {
      expect(getCardType("5018001234567890")).toBe("verve");
    });
  });

  describe("unknown card", () => {
    it("returns null for an unrecognized card number", () => {
      expect(getCardType("1234567890123456")).toBeNull();
    });

    it("returns null for an empty string", () => {
      expect(getCardType("")).toBeNull();
    });
  });
});
