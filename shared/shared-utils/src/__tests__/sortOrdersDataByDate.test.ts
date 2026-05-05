import { describe, it, expect } from "vitest";
import { sortOrdersDataByDate } from "../sortOrdersDataByDate";

const makeOrder = (createdAt: string) => ({ createdAt } as any);

describe("sortOrdersDataByDate", () => {
  it("returns an empty array for empty input", () => {
    expect(sortOrdersDataByDate([])).toEqual([]);
  });

  it("wraps a single order in one group", () => {
    // Mid-month noon UTC avoids local-timezone date roll-overs
    const result = sortOrdersDataByDate([makeOrder("2024-03-15T12:00:00Z")]);
    expect(result).toHaveLength(1);
    expect(result[0].data).toHaveLength(1);
    expect(result[0].date).toContain("March");
  });

  it("groups orders from the same month together", () => {
    const orders = [
      makeOrder("2024-01-15T12:00:00Z"),
      makeOrder("2024-01-20T12:00:00Z"),
      makeOrder("2024-02-15T12:00:00Z"),
    ];
    const result = sortOrdersDataByDate(orders);
    expect(result).toHaveLength(2);
    const janGroup = result.find((g) => g.date.includes("January"));
    expect(janGroup?.data).toHaveLength(2);
  });

  it("creates separate groups for different months", () => {
    const orders = [
      makeOrder("2024-01-15T12:00:00Z"),
      makeOrder("2024-06-15T12:00:00Z"),
      makeOrder("2024-12-15T12:00:00Z"),
    ];
    const result = sortOrdersDataByDate(orders);
    expect(result).toHaveLength(3);
  });
});
