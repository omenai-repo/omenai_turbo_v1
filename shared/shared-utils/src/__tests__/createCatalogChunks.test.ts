import { describe, it, expect } from "vitest";
import { catalogChunk } from "../createCatalogChunks";

describe("catalogChunk", () => {
  it("splits an even array into n equal chunks", () => {
    expect(catalogChunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("distributes remainder elements to the first chunks", () => {
    expect(catalogChunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2, 3], [4, 5]]);
  });

  it("creates 3 equal chunks from 9 elements", () => {
    expect(catalogChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(catalogChunk([], 3)).toEqual([]);
  });

  it("works with string arrays", () => {
    expect(catalogChunk(["a", "b", "c", "d"], 2)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("handles chunk size larger than array length with empty trailing chunks", () => {
    const result = catalogChunk([1, 2], 5);
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual([1]);
    expect(result[1]).toEqual([2]);
    expect(result[2]).toEqual([]);
  });

  it("throws for null input", () => {
    expect(() => catalogChunk(null as any, 2)).toThrow("Input must be an array");
  });

  it("throws for zero chunk size", () => {
    expect(() => catalogChunk([1, 2, 3], 0)).toThrow(
      "Chunk size must be a positive integer"
    );
  });

  it("throws for a negative chunk size", () => {
    expect(() => catalogChunk([1, 2, 3], -1)).toThrow(
      "Chunk size must be a positive integer"
    );
  });

  it("throws for a non-integer chunk size", () => {
    expect(() => catalogChunk([1, 2, 3], 1.5)).toThrow(
      "Chunk size must be a positive integer"
    );
  });
});
