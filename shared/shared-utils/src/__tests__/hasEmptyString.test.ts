import { describe, it, expect } from "vitest";
import { hasEmptyString } from "../hasEmptyString";

describe("hasEmptyString", () => {
  it("returns true when an object has an empty string value", () => {
    expect(hasEmptyString({ name: "", age: 25 })).toBe(true);
  });

  it("returns true when only one of many values is an empty string", () => {
    expect(hasEmptyString({ a: "hello", b: "world", c: "" })).toBe(true);
  });

  it("returns false when all string values are non-empty", () => {
    expect(hasEmptyString({ name: "John", email: "john@example.com" })).toBe(
      false
    );
  });

  it("returns false when non-string values are present (0, null, array)", () => {
    expect(hasEmptyString({ count: 0, flag: null, items: [] })).toBe(false);
  });

  it("returns false for an empty object", () => {
    expect(hasEmptyString({})).toBe(false);
  });
});
