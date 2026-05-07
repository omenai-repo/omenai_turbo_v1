import { describe, it, expect } from "vitest";
import { determinePlanChange } from "../determinePlanChange";

describe("determinePlanChange", () => {
  describe("action — upgrade vs downgrade", () => {
    it("upgrade: foundation → gallery (higher tier)", () => {
      const { action } = determinePlanChange(
        "foundation",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(action).toBe("upgrade");
    });

    it("upgrade: gallery → principal (higher tier)", () => {
      const { action } = determinePlanChange(
        "gallery",
        "monthly",
        500,
        "monthly",
        "active"
      );
      expect(action).toBe("upgrade");
    });

    it("upgrade: same-tier renewal (index equal)", () => {
      const { action } = determinePlanChange(
        "gallery",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(action).toBe("upgrade");
    });

    it("downgrade: principal → gallery", () => {
      const { action } = determinePlanChange(
        "principal",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(action).toBe("downgrade");
    });

    it("downgrade: gallery → foundation", () => {
      const { action } = determinePlanChange(
        "gallery",
        "monthly",
        150,
        "monthly",
        "active"
      );
      expect(action).toBe("downgrade");
    });
  });

  describe("shouldCharge", () => {
    it("charges when status is expired (regardless of price)", () => {
      const { shouldCharge } = determinePlanChange(
        "foundation",
        "monthly",
        150,
        "monthly",
        "expired"
      );
      expect(shouldCharge).toBe(true);
    });

    it("charges when the new price is higher than the current price", () => {
      const { shouldCharge } = determinePlanChange(
        "foundation",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(shouldCharge).toBe(true);
    });

    it("does not charge on a downgrade with active status", () => {
      const { shouldCharge } = determinePlanChange(
        "principal",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(shouldCharge).toBe(false);
    });

    it("does not charge on a same-tier renewal at the same price with active status", () => {
      const { shouldCharge } = determinePlanChange(
        "gallery",
        "monthly",
        250,
        "monthly",
        "active"
      );
      expect(shouldCharge).toBe(false);
    });
  });

  describe("interval switching", () => {
    it("correctly uses yearly pricing when switching to yearly billing", () => {
      // foundation yearly price = 1530 < principal yearly price = 5100 → upgrade, shouldCharge
      const result = determinePlanChange(
        "foundation",
        "monthly",
        5100,
        "yearly",
        "active"
      );
      expect(result.action).toBe("upgrade");
      expect(result.shouldCharge).toBe(true);
    });
  });
});
