import { ArtistCategory } from "@omenai/shared-types";

const CATEGORY_PRICE_RANGES: Record<ArtistCategory, [number, number]> = {
  Emerging: [1000, 2750],
  "Early Mid-Career": [4000, 5750],
  "Mid-Career": [5000, 9000],
  "Late Mid-Career": [6500, 10000],
  Established: [10000, 30000],
  Elite: [20000, 100000],
};

// Medium Point Allocation (Max 60)
const MEDIUM_POINTS: Record<string, number> = {
  Photography: 10,
  "Works on paper": 15,
  "Acrylic on canvas/linen/panel": 25,
  "Mixed media on paper/canvas": 35,
  "Sculpture (Resin/plaster/clay)": 45,
  "Oil on canvas/panel": 55,
  "Sculpture (Bronze/stone/metal)": 60,
};

// Size Points Calculation (Incremental, Max 40)
const calculateSizePoints = (width: number, height: number): number => {
  const area = width * height; // cm²

  if (area < 400) return 3; // Below 20cm x 20cm
  if (area <= 900) return 6; // 20cm x 20cm to 30cm x 30cm
  if (area <= 1600) return 10; // 31cm x 31cm to 40cm x 40cm
  if (area <= 2500) return 15; // 41cm x 41cm to 50cm x 50cm
  if (area <= 3600) return 20; // 51cm x 51cm to 60cm x 60cm
  if (area <= 4900) return 25; // 61cm x 61cm to 70cm x 70cm
  if (area <= 6400) return 30; // 71cm x 71cm to 80cm x 80cm
  if (area <= 10000) return 35; // 81cm x 81cm to 100cm x 100cm
  return 40; // 101cm x 101cm and above
};

// Logarithmic Price Calculation
export const calculatePrice = (
  category: ArtistCategory,
  medium: string,
  width: number,
  height: number,
  k = 0.075
): number => {
  const [base, max] = CATEGORY_PRICE_RANGES[category];
  const mediumPoints = MEDIUM_POINTS[medium] || 0;
  const sizePoints = calculateSizePoints(width, height);
  const totalPoints = mediumPoints + sizePoints; // 0 to 100

  // Logarithmic formula
  const price = base + (max - base) * Math.log(k * totalPoints + 1);

  return Math.round(price); // Round to nearest whole number
};
