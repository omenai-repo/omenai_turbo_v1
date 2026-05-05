import { describe, it, expect } from "vitest";
import { convertPriceStringToNumber } from "../priceStringToNumberConverter";

describe("convertPriceStringToNumber", () => {
  it("converts a plain numeric string", () => {
    expect(convertPriceStringToNumber("500")).toBe(500);
  });

  it("strips a leading dollar sign", () => {
    expect(convertPriceStringToNumber("$1500")).toBe(1500);
  });

  it("removes thousands-separator commas", () => {
    expect(convertPriceStringToNumber("1,500")).toBe(1500);
  });

  it("handles combined dollar sign and commas", () => {
    expect(convertPriceStringToNumber("$1,000,000")).toBe(1000000);
  });

  it("handles decimal numbers", () => {
    expect(convertPriceStringToNumber("$1,234.56")).toBe(1234.56);
  });

  it("converts zero", () => {
    expect(convertPriceStringToNumber("$0")).toBe(0);
  });

  it("throws for a fully non-numeric string", () => {
    expect(() => convertPriceStringToNumber("abc")).toThrow(
      "Invalid price format"
    );
  });
});
