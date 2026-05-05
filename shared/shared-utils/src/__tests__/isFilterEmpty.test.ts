import { describe, it, expect } from "vitest";
import { isEmptyFilter, Filter } from "../isFilterEmpty";

describe("isEmptyFilter", () => {
  it("returns true when all filter arrays are empty", () => {
    const filter: Filter = { price: [], year: [], medium: [] };
    expect(isEmptyFilter(filter)).toBe(true);
  });

  it("returns false when the price filter has an entry", () => {
    const filter: Filter = {
      price: [{ min: 100, max: 500 }],
      year: [],
      medium: [],
    };
    expect(isEmptyFilter(filter)).toBe(false);
  });

  it("returns false when the medium filter has an entry", () => {
    const filter: Filter = { price: [], year: [], medium: ["oil"] };
    expect(isEmptyFilter(filter)).toBe(false);
  });

  it("returns false when the year filter has an entry", () => {
    const filter: Filter = {
      price: [],
      year: [{ min: 1990, max: 2000 }],
      medium: [],
    };
    expect(isEmptyFilter(filter)).toBe(false);
  });
});
