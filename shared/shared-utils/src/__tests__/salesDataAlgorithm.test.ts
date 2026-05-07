import { describe, it, expect } from "vitest";
import { salesDataAlgorithm } from "../salesDataAlgorithm";

describe("salesDataAlgorithm", () => {
  it("returns 12 zero-valued points when salesData is empty", () => {
    const result = salesDataAlgorithm([], "gallery-1");
    expect(result.id).toBe("gallery-1");
    expect(result.data).toHaveLength(12);
    expect(result.data.every((d: { x: string; y: number }) => d.y === 0)).toBe(
      true
    );
  });

  it("returns 12 zero-valued points when salesData is null", () => {
    const result = salesDataAlgorithm(null, "test");
    expect(result.data).toHaveLength(12);
    expect(result.data.every((d: { x: string; y: number }) => d.y === 0)).toBe(
      true
    );
  });

  it("aggregates values for the same month", () => {
    const data = [
      { month: "Jan", value: 100 },
      { month: "Jan", value: 200 },
      { month: "Mar", value: 500 },
    ];
    const result = salesDataAlgorithm(data, "test-id");
    const jan = result.data.find((d: { x: string }) => d.x === "Jan");
    const mar = result.data.find((d: { x: string }) => d.x === "Mar");
    const feb = result.data.find((d: { x: string }) => d.x === "Feb");
    expect(jan?.y).toBe(300);
    expect(mar?.y).toBe(500);
    expect(feb?.y).toBe(0);
  });

  it("orders data points in calendar order (Jan first, Dec last)", () => {
    const result = salesDataAlgorithm([], "test");
    const months = result.data.map((d: { x: string }) => d.x);
    expect(months[0]).toBe("Jan");
    expect(months[11]).toBe("Dec");
  });

  it("uses the provided id in the result", () => {
    expect(salesDataAlgorithm([], "my-gallery").id).toBe("my-gallery");
  });
});
