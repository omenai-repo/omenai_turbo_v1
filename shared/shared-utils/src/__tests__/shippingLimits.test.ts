import { describe, it, expect } from "vitest";
import {
  checkCarrierLimit,
  checkIfRolledPassesLimit,
} from "../shippingLimits";

describe("checkCarrierLimit", () => {
  describe("UPS — longestSide + girth > 419.1 cm", () => {
    it("returns true when the combined measurement exceeds the limit", () => {
      // dims sorted: [300, 100, 100] → girth = 400 → 300+400 = 700 > 419.1
      expect(checkCarrierLimit(300, 100, 100, 5, "UPS")).toBe(true);
    });

    it("returns false when the combined measurement is within the limit", () => {
      // dims: [100, 50, 50] → girth = 200 → 100+200 = 300 < 419.1
      expect(checkCarrierLimit(100, 50, 50, 5, "UPS")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(checkCarrierLimit(100, 50, 50, 5, "ups")).toBe(false);
    });
  });

  describe("DHL — longest side > 300 cm OR weight > 300 kg", () => {
    it("returns true when the longest side exceeds the limit", () => {
      expect(checkCarrierLimit(350, 50, 50, 10, "DHL")).toBe(true);
    });

    it("returns true when the weight exceeds the limit", () => {
      expect(checkCarrierLimit(100, 50, 50, 350, "DHL")).toBe(true);
    });

    it("returns false when within both limits", () => {
      expect(checkCarrierLimit(100, 50, 50, 10, "DHL")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(checkCarrierLimit(350, 50, 50, 10, "dhl")).toBe(true);
    });
  });

  describe("unknown carrier", () => {
    it("returns false for an unrecognized carrier", () => {
      expect(checkCarrierLimit(1000, 1000, 1000, 1000, "FEDEX")).toBe(false);
    });
  });
});

describe("checkIfRolledPassesLimit", () => {
  it("returns true (passes) when a small rolled canvas is within the carrier limit", () => {
    // shortestSide=40, tubeLength=50 → UPS: 50 + (2*15+2*15)=110 < 419.1 → passes
    expect(checkIfRolledPassesLimit(50, 40, "UPS")).toBe(true);
  });

  it("returns false (fails) when a large rolled canvas exceeds the carrier limit", () => {
    // shortestSide=400, tubeLength=410 → UPS: 410 + 60 = 470 > 419.1 → fails
    expect(checkIfRolledPassesLimit(500, 400, "UPS")).toBe(false);
  });
});
