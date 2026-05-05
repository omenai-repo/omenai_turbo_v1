import { describe, it, expect } from "vitest";
import { isRepeatingOrConsecutive } from "../checkIfPinRepeating";

describe("isRepeatingOrConsecutive", () => {
  describe("repeating digits", () => {
    it("rejects 0000", () => {
      expect(isRepeatingOrConsecutive("0000")).toBe(true);
    });

    it("rejects 1111", () => {
      expect(isRepeatingOrConsecutive("1111")).toBe(true);
    });

    it("rejects 9999", () => {
      expect(isRepeatingOrConsecutive("9999")).toBe(true);
    });
  });

  describe("ascending consecutive digits", () => {
    it("rejects 1234", () => {
      expect(isRepeatingOrConsecutive("1234")).toBe(true);
    });

    it("rejects 0123", () => {
      expect(isRepeatingOrConsecutive("0123")).toBe(true);
    });

    it("rejects 6789", () => {
      expect(isRepeatingOrConsecutive("6789")).toBe(true);
    });
  });

  describe("descending consecutive digits", () => {
    it("rejects 4321", () => {
      expect(isRepeatingOrConsecutive("4321")).toBe(true);
    });

    it("rejects 9876", () => {
      expect(isRepeatingOrConsecutive("9876")).toBe(true);
    });
  });

  describe("valid PINs", () => {
    it("accepts 1357", () => {
      expect(isRepeatingOrConsecutive("1357")).toBe(false);
    });

    it("accepts 2468", () => {
      expect(isRepeatingOrConsecutive("2468")).toBe(false);
    });

    it("accepts 1928", () => {
      expect(isRepeatingOrConsecutive("1928")).toBe(false);
    });

    it("accepts 5271", () => {
      expect(isRepeatingOrConsecutive("5271")).toBe(false);
    });
  });

  describe("invalid input", () => {
    it("throws for a 3-digit string", () => {
      expect(() => isRepeatingOrConsecutive("123")).toThrow(
        "PIN must be a 4-digit number string"
      );
    });

    it("throws for a 5-digit string", () => {
      expect(() => isRepeatingOrConsecutive("12345")).toThrow(
        "PIN must be a 4-digit number string"
      );
    });

    it("throws when letters are present", () => {
      expect(() => isRepeatingOrConsecutive("12ab")).toThrow(
        "PIN must be a 4-digit number string"
      );
    });
  });
});
