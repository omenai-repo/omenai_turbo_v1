import { describe, it, expect } from "vitest";
import { generateDigit, generateAlphaDigit } from "../generateToken";

describe("generateDigit", () => {
  it("generates a numeric-only string of the requested length", () => {
    const token = generateDigit(6);
    expect(token).toHaveLength(6);
    expect(/^\d+$/.test(token)).toBe(true);
  });

  it("honours different length requests", () => {
    expect(generateDigit(4)).toHaveLength(4);
    expect(generateDigit(10)).toHaveLength(10);
  });

  it("produces unique values on successive calls", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateDigit(8)));
    expect(tokens.size).toBeGreaterThan(1);
  });
});

describe("generateAlphaDigit", () => {
  it("generates an alphanumeric string of the requested length", () => {
    const token = generateAlphaDigit(10);
    expect(token).toHaveLength(10);
    expect(/^[a-z0-9]+$/i.test(token)).toBe(true);
  });

  it("honours different length requests", () => {
    expect(generateAlphaDigit(4)).toHaveLength(4);
    expect(generateAlphaDigit(16)).toHaveLength(16);
  });

  it("produces unique values on successive calls", () => {
    const tokens = new Set(
      Array.from({ length: 20 }, () => generateAlphaDigit(12))
    );
    expect(tokens.size).toBeGreaterThan(1);
  });
});
