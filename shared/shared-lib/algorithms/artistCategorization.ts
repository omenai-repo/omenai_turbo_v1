import {
  ArtistCategory,
  ArtistCategorizationAlgorithmResult,
  ArtistCategorizationAnswerTypes,
} from "@omenai/shared-types";

const pointsStructure: {
  [key: string]: { [key: string]: number } | ((val: number) => number);
} = {
  graduate: { yes: 10, no: 0 },
  mfa: { yes: 15, no: 0 },
  solo: (val: number) => (val >= 15 ? 30 : val >= 6 ? 20 : val >= 1 ? 10 : 0),
  group: (val: number) => (val >= 15 ? 20 : val >= 6 ? 15 : val >= 1 ? 5 : 0),
  museum_collection: { yes: 25, no: 0 },
  biennale: {
    venice: 40,
    "other recognized biennale events": 15,
    none: 0,
  },
  museum_exhibition: { yes: 40, no: 0 },
  art_fair: { yes: 20, no: 0 },
};

const ratingCategories: {
  min: number;
  max: number;
  rating: ArtistCategory;
  price_range: { min: number; max: number };
}[] = [
  {
    min: 0,
    max: 29,
    rating: "Emerging",
    price_range: { min: 1000, max: 2750 },
  },
  {
    min: 30,
    max: 49,
    rating: "Early Mid-Career",
    price_range: { min: 4000, max: 5750 },
  },
  {
    min: 50,
    max: 69,
    rating: "Mid-Career",
    price_range: { min: 5000, max: 9000 },
  },
  {
    min: 70,
    max: 89,
    rating: "Late Mid-Career",
    price_range: { min: 6500, max: 10000 },
  },
  {
    min: 90,
    max: 150,
    rating: "Established",
    price_range: { min: 10000, max: 30000 },
  },
  {
    min: 150,
    max: 200,
    rating: "Elite",
    price_range: { min: 20000, max: 100000 },
  },
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
      obj.biennale === "other recognized biennale events" ||
      obj.biennale === "none") &&
    (obj.museum_exhibition === "yes" || obj.museum_exhibition === "no") &&
    (obj.art_fair === "yes" || obj.art_fair === "no")
  );
}

export function calculateArtistRating(
  answers: ArtistCategorizationAnswerTypes
): ArtistCategorizationAlgorithmResult {
  if (!isAnswers(answers)) {
    return {
      status: "error",
      totalPoints: 0,
      rating: "Unknown",
      error: "Invalid answers data provided.",
      price_range: { min: 0, max: 0 },
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
          price_range: { min: 0, max: 0 },
        };
      }
    }
  } catch (error) {
    return {
      status: "error",
      totalPoints: 0,
      rating: "Unknown",
      error: "An unexpected error occurred.",
      price_range: { min: 0, max: 0 },
    };
  }

  const category = ratingCategories.find(
    (category) => totalPoints >= category.min && totalPoints <= category.max
  ) || { rating: "Unknown", price_range: { min: 0, max: 0 } };

  return {
    status: "success",
    totalPoints,
    rating: category.rating,
    price_range: category.price_range,
  };
}
