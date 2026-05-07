import { describe, it, expect } from "vitest";
import { trimWhiteSpace } from "../trimWhitePace";

describe("trimWhiteSpace", () => {
  it("removes leading and trailing whitespace", () => {
    expect(trimWhiteSpace("  hello  ")).toBe("hello");
  });

  it("collapses multiple internal spaces into one", () => {
    expect(trimWhiteSpace("hello   world")).toBe("hello world");
  });

  it("normalises tabs and newlines to single spaces", () => {
    expect(trimWhiteSpace("\thello\n  world\t")).toBe("hello world");
  });

  it("returns the string unchanged when no extra spaces exist", () => {
    expect(trimWhiteSpace("hello world")).toBe("hello world");
  });

  it("returns an empty string for a whitespace-only input", () => {
    expect(trimWhiteSpace("   ")).toBe("");
  });

  it("handles an already-empty string", () => {
    expect(trimWhiteSpace("")).toBe("");
  });
});
