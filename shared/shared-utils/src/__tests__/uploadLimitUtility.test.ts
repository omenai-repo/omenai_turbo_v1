import { describe, it, expect } from "vitest";
import { getUploadLimitLookup } from "../uploadLimitUtility";

describe("getUploadLimitLookup", () => {
  describe("Foundation plan", () => {
    it("returns 15 for monthly", () => {
      expect(getUploadLimitLookup("Foundation", "monthly")).toBe(15);
    });

    it("returns 180 for yearly", () => {
      expect(getUploadLimitLookup("Foundation", "yearly")).toBe(180);
    });

    it("returns 60 for monthly with free trial", () => {
      expect(getUploadLimitLookup("Foundation", "monthly", true)).toBe(60);
    });

    it("returns 60 for yearly with free trial", () => {
      expect(getUploadLimitLookup("Foundation", "yearly", true)).toBe(60);
    });
  });

  describe("Gallery plan", () => {
    it("returns 60 for monthly", () => {
      expect(getUploadLimitLookup("Gallery", "monthly")).toBe(60);
    });

    it("returns 760 for yearly", () => {
      expect(getUploadLimitLookup("Gallery", "yearly")).toBe(760);
    });

    it("returns 60 for monthly with free trial", () => {
      expect(getUploadLimitLookup("Gallery", "monthly", true)).toBe(60);
    });
  });

  describe("Principal plan", () => {
    it("returns MAX_SAFE_INTEGER for monthly", () => {
      expect(getUploadLimitLookup("Principal", "monthly")).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });

    it("returns MAX_SAFE_INTEGER for yearly", () => {
      expect(getUploadLimitLookup("Principal", "yearly")).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });

    it("ignores free trial flag and still returns MAX_SAFE_INTEGER", () => {
      expect(getUploadLimitLookup("Principal", "monthly", true)).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });
  });
});
