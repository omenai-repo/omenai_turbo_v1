import { describe, it, expect } from "vitest";
import { hasFilterValue } from "../checkIfFilterExists";

const filters = [
  { name: "medium", label: "Medium", value: "oil" },
  { name: "price", label: "Price", value: "100-500" },
];

describe("hasFilterValue", () => {
  it("returns true when the name exists in the array", () => {
    expect(hasFilterValue(filters, "medium")).toBe(true);
  });

  it("returns true for the second item in the array", () => {
    expect(hasFilterValue(filters, "price")).toBe(true);
  });

  it("returns false when the name is not present", () => {
    expect(hasFilterValue(filters, "year")).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(hasFilterValue([], "medium")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(hasFilterValue(filters, "Medium")).toBe(false);
  });
});
