import {
  ArtistCategorization,
  ArtistCategorizationAnswerTypes,
} from "@omenai/shared-types";

type Result = {
  status: "success" | "error";
  totalPoints: number;
  rating: string;
  error?: string;
};

const pointsStructure: {
  [key: string]: { [key: string]: number } | ((val: number) => number);
} = {
  graduate: { yes: 10, no: 0 },
  mfa: { yes: 15, no: 0 },
  solo: (val: number) => (val >= 15 ? 30 : val),
  group: (val: number) => (val >= 15 ? 20 : val),
  museum_collection: { yes: 25, no: 0 },
  biennale: {
    venice: 40,
    other: 15,
    none: 0,
  },
  museum_exhibition: { yes: 40, no: 0 },
  art_fair: { yes: 20, no: 0 },
};

const ratingCategories: {
  min: number;
  max: number;
  rating: ArtistCategorization;
}[] = [
  { min: 0, max: 29, rating: "Emerging" },
  { min: 30, max: 49, rating: "Early Mid-career" },
  { min: 50, max: 69, rating: "Mid-career" },
  { min: 70, max: 89, rating: "Late Mid-career" },
  { min: 90, max: 150, rating: "Established" },
  { min: 150, max: 200, rating: "Elite" },
];

function isAnswers(
  obj: ArtistCategorizationAnswerTypes
): obj is ArtistCategorizationAnswerTypes {
  const keys = [
    "graduate",
    "mfa",
    "solo",
    "group",
    "museum_collection",
    "biennale",
    "museum_exhibition",
    "art_fair",
  ];

  return (
    typeof obj === "object" &&
    obj !== null &&
    keys.every((key) => key in obj) &&
    (obj.graduate === "yes" || obj.graduate === "no") &&
    (obj.mfa === "yes" || obj.mfa === "no") &&
    typeof obj.solo === "number" &&
    typeof obj.group === "number" &&
    (obj.museum_collection === "yes" || obj.museum_collection === "no") &&
    (obj.biennale === "venice" ||
      obj.biennale === "other" ||
      obj.biennale === "none") &&
    (obj.museum_exhibition === "yes" || obj.museum_exhibition === "no") &&
    (obj.art_fair === "yes" || obj.art_fair === "no")
  );
}

export function calculateArtistRating(
  answers: ArtistCategorizationAnswerTypes
): Result {
  if (!isAnswers(answers)) {
    return {
      status: "error",
      totalPoints: 0,
      rating: "Unknown",
      error: "Invalid answers data provided.",
    };
  }

  let totalPoints = 0;

  try {
    for (const question in answers) {
      const key = question as keyof ArtistCategorizationAnswerTypes;
      let answer = answers[key];

      const points =
        typeof pointsStructure[question] === "function"
          ? (pointsStructure[question] as (val: number) => number)(
              Number(answer)
            )
          : pointsStructure[question][answer];

      if (points !== undefined) {
        totalPoints += points;
      } else {
        return {
          status: "error",
          totalPoints: 0,
          rating: "Unknown",
          error: `Invalid answer provided for question: ${question}`,
        };
      }
    }
  } catch (error) {
    return {
      status: "error",
      totalPoints: 0,
      rating: "Unknown",
      error: "An unexpected error occurred.",
    };
  }

  const rating =
    ratingCategories.find(
      (category) => totalPoints >= category.min && totalPoints <= category.max
    )?.rating || "Unknown";

  return { status: "success", totalPoints, rating };
}
//solo  >= 6 ? 20 : val >= 1 ? 10 : 0
//group  >= 6 ? 15 : val >= 1 ? 5 : 0
