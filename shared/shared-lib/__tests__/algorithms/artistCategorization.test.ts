import { describe, it, expect } from "vitest";
import { calculateArtistRating } from "../../algorithms/artistCategorization";

const baseAnswers = {
  graduate: "no" as const,
  mfa: "no" as const,
  solo: 0,
  group: 0,
  museum_collection: "no" as const,
  biennale: "none" as const,
  museum_exhibition: "no" as const,
  art_fair: "no" as const,
};

describe("calculateArtistRating", () => {
  describe("input validation", () => {
    it("returns error status when answers object is null", () => {
      const result = calculateArtistRating(null as any);
      expect(result.status).toBe("error");
      expect(result.error).toBe("Invalid answers data provided.");
    });

    it("returns error status when a required key is missing", () => {
      const { graduate, ...incomplete } = baseAnswers;
      const result = calculateArtistRating(incomplete as any);
      expect(result.status).toBe("error");
    });

    it("returns error status when graduate has an invalid value", () => {
      const result = calculateArtistRating({ ...baseAnswers, graduate: "maybe" as any });
      expect(result.status).toBe("error");
    });

    it("returns error status when biennale has an invalid value", () => {
      const result = calculateArtistRating({ ...baseAnswers, biennale: "cannes" as any });
      expect(result.status).toBe("error");
    });

    it("returns error status when solo is not a number", () => {
      const result = calculateArtistRating({ ...baseAnswers, solo: "five" as any });
      expect(result.status).toBe("error");
    });
  });

  describe("point calculation", () => {
    it("returns 0 points for all-no answers (Emerging)", () => {
      const result = calculateArtistRating(baseAnswers);
      expect(result.status).toBe("success");
      expect(result.totalPoints).toBe(0);
      expect(result.rating).toBe("Emerging");
    });

    it("adds 10 points for graduate=yes", () => {
      const result = calculateArtistRating({ ...baseAnswers, graduate: "yes" });
      expect(result.totalPoints).toBe(10);
    });

    it("adds 15 points for mfa=yes", () => {
      const result = calculateArtistRating({ ...baseAnswers, mfa: "yes" });
      expect(result.totalPoints).toBe(15);
    });

    it("adds 25 points for museum_collection=yes", () => {
      const result = calculateArtistRating({ ...baseAnswers, museum_collection: "yes" });
      expect(result.totalPoints).toBe(25);
    });

    it("adds 40 points for museum_exhibition=yes", () => {
      const result = calculateArtistRating({ ...baseAnswers, museum_exhibition: "yes" });
      expect(result.totalPoints).toBe(40);
    });

    it("adds 20 points for art_fair=yes", () => {
      const result = calculateArtistRating({ ...baseAnswers, art_fair: "yes" });
      expect(result.totalPoints).toBe(20);
    });

    it("adds 40 points for biennale=venice", () => {
      const result = calculateArtistRating({ ...baseAnswers, biennale: "venice" });
      expect(result.totalPoints).toBe(40);
    });

    it("adds 15 points for biennale=other recognized biennale events", () => {
      const result = calculateArtistRating({ ...baseAnswers, biennale: "other recognized biennale events" });
      expect(result.totalPoints).toBe(15);
    });
  });

  describe("solo exhibition scoring (function-based)", () => {
    it("gives 0 points for 0 solo shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, solo: 0 });
      expect(result.totalPoints).toBe(0);
    });

    it("gives 10 points for 1 solo show", () => {
      const result = calculateArtistRating({ ...baseAnswers, solo: 1 });
      expect(result.totalPoints).toBe(10);
    });

    it("gives 20 points for 6 solo shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, solo: 6 });
      expect(result.totalPoints).toBe(20);
    });

    it("gives 30 points for 15+ solo shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, solo: 15 });
      expect(result.totalPoints).toBe(30);
    });
  });

  describe("group exhibition scoring (function-based)", () => {
    it("gives 0 points for 0 group shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, group: 0 });
      expect(result.totalPoints).toBe(0);
    });

    it("gives 5 points for 1 group show", () => {
      const result = calculateArtistRating({ ...baseAnswers, group: 1 });
      expect(result.totalPoints).toBe(5);
    });

    it("gives 15 points for 6 group shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, group: 6 });
      expect(result.totalPoints).toBe(15);
    });

    it("gives 20 points for 15+ group shows", () => {
      const result = calculateArtistRating({ ...baseAnswers, group: 15 });
      expect(result.totalPoints).toBe(20);
    });
  });

  describe("category thresholds", () => {
    it("rates 0-29 points as Emerging", () => {
      const result = calculateArtistRating({ ...baseAnswers, graduate: "yes", mfa: "no" });
      expect(result.totalPoints).toBe(10);
      expect(result.rating).toBe("Emerging");
      expect(result.price_range).toEqual({ min: 1000, max: 2750 });
    });

    it("rates 30-49 points as Early Mid-Career", () => {
      // graduate(10) + mfa(15) + group=6(15) = 40
      const result = calculateArtistRating({ ...baseAnswers, graduate: "yes", mfa: "yes", group: 6 });
      expect(result.totalPoints).toBe(40);
      expect(result.rating).toBe("Early Mid-Career");
      expect(result.price_range).toEqual({ min: 4000, max: 5750 });
    });

    it("rates 50-69 points as Mid-Career", () => {
      // museum_collection(25) + museum_exhibition(40) = 65
      const result = calculateArtistRating({
        ...baseAnswers,
        museum_collection: "yes",
        museum_exhibition: "yes",
      });
      expect(result.totalPoints).toBe(65);
      expect(result.rating).toBe("Mid-Career");
      expect(result.price_range).toEqual({ min: 5000, max: 9000 });
    });

    it("rates 70-89 points as Late Mid-Career", () => {
      // museum_exhibition(40) + biennale-other(15) + mfa(15) + group=1(5) = 75
      const result = calculateArtistRating({
        ...baseAnswers,
        museum_exhibition: "yes",
        biennale: "other recognized biennale events",
        mfa: "yes",
        group: 1,
      });
      expect(result.totalPoints).toBe(75);
      expect(result.rating).toBe("Late Mid-Career");
      expect(result.price_range).toEqual({ min: 6500, max: 10000 });
    });

    it("rates 90-150 points as Established", () => {
      // museum_exhibition(40) + biennale-venice(40) + museum_collection(25) = 105
      const result = calculateArtistRating({
        ...baseAnswers,
        museum_exhibition: "yes",
        biennale: "venice",
        museum_collection: "yes",
      });
      expect(result.totalPoints).toBe(105);
      expect(result.rating).toBe("Established");
      expect(result.price_range).toEqual({ min: 10000, max: 30000 });
    });

    it("rates 150+ points as Elite", () => {
      // All yes, max solo/group = biennale-venice(40) + museum_exhibition(40) + museum_collection(25) + art_fair(20) + solo>=15(30) + group>=15(20) + mfa(15) + graduate(10) = 200
      const result = calculateArtistRating({
        graduate: "yes",
        mfa: "yes",
        solo: 20,
        group: 20,
        museum_collection: "yes",
        biennale: "venice",
        museum_exhibition: "yes",
        art_fair: "yes",
      });
      expect(result.totalPoints).toBe(200);
      expect(result.rating).toBe("Elite");
      expect(result.price_range).toEqual({ min: 20000, max: 100000 });
    });
  });
});
