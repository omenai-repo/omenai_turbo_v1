import { describe, it, expect } from "vitest";
import {
  calculatePurchaseGrandTotal,
  calculatePurchaseGrandTotalNumber,
} from "../calculatePurchaseGrandTotal";

describe("calculatePurchaseGrandTotal", () => {
  it("sums price, fees, and taxes into a fixed-2 string", () => {
    expect(calculatePurchaseGrandTotal(1000, "$50.00", "$80.00")).toBe(
      "1130.00"
    );
  });

  it("strips non-numeric characters from fees and taxes", () => {
    expect(calculatePurchaseGrandTotal(500, "VAT $25.50", "Fee: $10.00")).toBe(
      "535.50"
    );
  });

  it("handles zero fees and taxes", () => {
    expect(calculatePurchaseGrandTotal(200, "$0", "$0")).toBe("200.00");
  });

  it("preserves 2 decimal places in the result", () => {
    expect(calculatePurchaseGrandTotal(100, "$0.50", "$0.75")).toBe("101.25");
  });
});

describe("calculatePurchaseGrandTotalNumber", () => {
  it("returns the numeric sum of price, fees, and taxes", () => {
    expect(calculatePurchaseGrandTotalNumber(1000, 50, 80)).toBe(1130);
  });

  it("handles zero fees and taxes", () => {
    expect(calculatePurchaseGrandTotalNumber(500, 0, 0)).toBe(500);
  });

  it("handles decimal values", () => {
    expect(
      calculatePurchaseGrandTotalNumber(100.5, 10.25, 5.25)
    ).toBeCloseTo(116);
  });
});
