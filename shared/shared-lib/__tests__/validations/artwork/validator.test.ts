import { describe, it, expect } from "vitest";
import { validate } from "../../../validations/upload_artwork_input_validator/validator";

describe("artwork validator dispatch", () => {
  describe("artist label", () => {
    it("succeeds for valid artist name", () => {
      expect(validate("artist", "Vincent van Gogh").success).toBe(true);
    });

    it("fails for artist name shorter than 3 characters", () => {
      expect(validate("artist", "VG").success).toBe(false);
    });
  });

  describe("title label", () => {
    it("succeeds for valid title", () => {
      expect(validate("title", "Starry Night").success).toBe(true);
    });

    it("fails for title with unsafe characters", () => {
      expect(validate("title", "<script>alert(1)</script>").success).toBe(false);
    });
  });

  describe("materials label", () => {
    it("succeeds for valid materials description", () => {
      expect(validate("materials", "Oil on canvas").success).toBe(true);
    });
  });

  describe("height and width labels", () => {
    it("succeeds for valid measurement in inches", () => {
      expect(validate("height", "24in").success).toBe(true);
      expect(validate("width", "18in").success).toBe(true);
    });

    it("fails for measurement without unit", () => {
      expect(validate("height", "24").success).toBe(false);
      expect(validate("width", "18").success).toBe(false);
    });
  });

  describe("price label", () => {
    it("succeeds for a valid numeric price", () => {
      expect(validate("price", "5000").success).toBe(true);
    });

    it("fails for a price with currency symbol", () => {
      expect(validate("price", "$5000").success).toBe(false);
    });

    it("succeeds for empty price (optional field)", () => {
      expect(validate("price", "").success).toBe(true);
    });
  });

  describe("weight label", () => {
    it("succeeds for valid weight in lbs", () => {
      expect(validate("weight", "15lbs").success).toBe(true);
    });

    it("fails for weight without unit", () => {
      expect(validate("weight", "15").success).toBe(false);
    });
  });

  describe("year labels", () => {
    it("succeeds for a valid year", () => {
      expect(validate("year", "1990").success).toBe(true);
      expect(validate("artist_birthyear", "1965").success).toBe(true);
    });

    it("fails for a 3-digit year", () => {
      expect(validate("year", "199").success).toBe(false);
    });
  });

  describe("artwork_description label", () => {
    it("succeeds for a valid description", () => {
      expect(validate("artwork_description", "A beautiful landscape").success).toBe(true);
    });

    it("fails for description with unsafe characters", () => {
      expect(validate("artwork_description", "Nice [artwork]").success).toBe(false);
    });
  });
});
