import { describe, it, expect } from "vitest";
import {
  calculateArtworkPrice,
  getSizeCategory,
} from "../../algorithms/priceGenerator";
import type { ArtworkDetails } from "../../algorithms/priceGenerator";

const makeArtwork = (overrides: Partial<ArtworkDetails> = {}): ArtworkDetails => ({
  artistCategory: "Emerging",
  medium: "Photography",
  height: 20,
  width: 20,
  ...overrides,
});

describe("getSizeCategory", () => {
  it("classifies small artwork (maxDim <= 40, area <= 1200)", () => {
    expect(getSizeCategory(20, 20)).toBe("Small");
  });

  it("classifies medium artwork", () => {
    expect(getSizeCategory(50, 50)).toBe("Medium");
  });

  it("classifies large artwork", () => {
    expect(getSizeCategory(100, 100)).toBe("Large");
  });

  it("classifies by maxDimension even if area is small", () => {
    expect(getSizeCategory(45, 5)).toBe("Medium");
  });
});

describe("calculateArtworkPrice", () => {
  describe("return shape", () => {
    it("returns recommendedPrice, priceRange, and meanPrice", () => {
      const result = calculateArtworkPrice(makeArtwork());
      expect(result).toHaveProperty("recommendedPrice");
      expect(result).toHaveProperty("priceRange");
      expect(result).toHaveProperty("meanPrice");
    });

    it("priceRange has exactly 5 elements", () => {
      const result = calculateArtworkPrice(makeArtwork());
      expect(result.priceRange).toHaveLength(5);
    });

    it("priceRange is sorted in ascending order", () => {
      const result = calculateArtworkPrice(makeArtwork());
      const sorted = [...result.priceRange].sort((a, b) => a - b);
      expect(result.priceRange).toEqual(sorted);
    });
  });

  describe("category range enforcement", () => {
    it("Emerging prices stay within [500, 2500]", () => {
      const result = calculateArtworkPrice(makeArtwork({ artistCategory: "Emerging" }));
      result.priceRange.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(500);
        expect(p).toBeLessThanOrEqual(2500);
      });
    });

    it("Elite prices stay within [12000, 50000]", () => {
      const result = calculateArtworkPrice(makeArtwork({ artistCategory: "Elite", height: 80, width: 80 }));
      result.priceRange.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(12000);
        expect(p).toBeLessThanOrEqual(50000);
      });
    });

    it("Established prices stay within [7000, 15000]", () => {
      const result = calculateArtworkPrice(makeArtwork({ artistCategory: "Established", height: 50, width: 50 }));
      result.priceRange.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(7000);
        expect(p).toBeLessThanOrEqual(15000);
      });
    });
  });

  describe("price ordering across categories", () => {
    it("Elite artworks price higher than Emerging for same size/medium", () => {
      const emerging = calculateArtworkPrice(makeArtwork({ artistCategory: "Emerging", medium: "Oil on canvas/panel", height: 60, width: 60 }));
      const elite = calculateArtworkPrice(makeArtwork({ artistCategory: "Elite", medium: "Oil on canvas/panel", height: 60, width: 60 }));
      expect(elite.meanPrice).toBeGreaterThan(emerging.meanPrice);
    });
  });

  describe("medium pricing hierarchy", () => {
    it("Oil on canvas/panel prices higher than Photography for same artist/size", () => {
      const photo = calculateArtworkPrice(makeArtwork({ medium: "Photography", height: 50, width: 50, artistCategory: "Mid-Career" }));
      const oil = calculateArtworkPrice(makeArtwork({ medium: "Oil on canvas/panel", height: 50, width: 50, artistCategory: "Mid-Career" }));
      expect(oil.meanPrice).toBeGreaterThan(photo.meanPrice);
    });
  });

  describe("size effect on pricing", () => {
    it("larger artwork commands a higher price than smaller artwork", () => {
      const small = calculateArtworkPrice(makeArtwork({ height: 10, width: 10, artistCategory: "Mid-Career", medium: "Oil on canvas/panel" }));
      const large = calculateArtworkPrice(makeArtwork({ height: 80, width: 80, artistCategory: "Mid-Career", medium: "Oil on canvas/panel" }));
      expect(large.meanPrice).toBeGreaterThan(small.meanPrice);
    });
  });

  describe("meanPrice calculation", () => {
    it("meanPrice is the midpoint of priceRange min and max", () => {
      const result = calculateArtworkPrice(makeArtwork({ height: 50, width: 50, artistCategory: "Mid-Career", medium: "Acrylic on canvas/linen/panel" }));
      const expectedMean = Math.round((result.priceRange[0] + result.priceRange[4]) / 2);
      expect(result.meanPrice).toBe(expectedMean);
    });
  });

  describe("all artist categories", () => {
    const categories = [
      "Emerging",
      "Early Mid-Career",
      "Mid-Career",
      "Late Mid-Career",
      "Established",
      "Elite",
    ] as const;

    categories.forEach((category) => {
      it(`produces valid output for ${category}`, () => {
        const result = calculateArtworkPrice(makeArtwork({ artistCategory: category, height: 40, width: 40 }));
        expect(result.priceRange).toHaveLength(5);
        expect(result.recommendedPrice).toBeGreaterThan(0);
      });
    });
  });

  describe("all mediums", () => {
    const mediums = [
      "Photography",
      "Works on paper",
      "Acrylic on canvas/linen/panel",
      "Mixed media on canvas",
      "Oil on canvas/panel",
    ] as const;

    mediums.forEach((medium) => {
      it(`produces valid output for ${medium}`, () => {
        const result = calculateArtworkPrice(makeArtwork({ medium }));
        expect(result.priceRange).toHaveLength(5);
      });
    });
  });
});
