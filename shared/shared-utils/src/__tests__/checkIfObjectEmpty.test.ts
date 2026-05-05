import { describe, it, expect } from "vitest";
import { allKeysEmpty } from "../checkIfObjectEmpty";

describe("allKeysEmpty", () => {
  it("returns true when a value is an empty string", () => {
    expect(allKeysEmpty({ name: "", age: 25 })).toBe(true);
  });

  it("returns true when a value is null", () => {
    expect(allKeysEmpty({ name: "John", email: null })).toBe(true);
  });

  it("returns true when a value is undefined", () => {
    expect(allKeysEmpty({ name: "John", phone: undefined })).toBe(true);
  });

  it("returns false when all values are non-empty", () => {
    expect(allKeysEmpty({ name: "John", age: 25 })).toBe(false);
  });

  it("returns false for an empty object (no keys to inspect)", () => {
    expect(allKeysEmpty({})).toBe(false);
  });

  it("returns false when values include 0 or false", () => {
    expect(allKeysEmpty({ count: 0, active: false })).toBe(false);
  });
});
