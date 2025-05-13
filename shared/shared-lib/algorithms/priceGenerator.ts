import { ArtistCategory } from "@omenai/shared-types";

// Category price ranges: [base, max]
const CATEGORY_PRICE_RANGES: Record<ArtistCategory, [number, number]> = {
  Emerging: [500, 2500],
  "Early Mid-Career": [1800, 5750],
  "Mid-Career": [3000, 8000],
  "Late Mid-Career": [4500, 9000],
  Established: [7500, 15000],
  Elite: [12000, 50000],
};

// Medium Point Allocation (Now Max 30)
const MEDIUM_POINTS: Record<string, number> = {
  Photography: 5,
  "Works on paper": 7,
  "Acrylic on canvas/linen/panel": 13,
  "Mixed media on paper/canvas": 17,
  "Sculpture (Resin/plaster/clay)": 22,
  "Oil on canvas/panel": 27,
  "Sculpture (Bronze/stone/metal)": 30,
};

// Size Points Calculation (Now Max 70)
const calculateSizePoints = (width: number, height: number): number => {
  const area = width * height; // cm²

  if (area < 400) return 7; // < 20cm x 20cm
  if (area <= 900) return 13; // 20cm x 20cm to 30cm x 30cm
  if (area <= 1600) return 21; // 31cm x 31cm to 40cm x 40cm
  if (area <= 2500) return 30; // 41cm x 41cm to 50cm x 50cm
  if (area <= 3600) return 38; // 51cm x 51cm to 60cm x 60cm
  if (area <= 4900) return 46; // 61cm x 61cm to 70cm x 70cm
  if (area <= 6400) return 55; // 71cm x 71cm to 80cm x 80cm
  if (area <= 10000) return 63; // 81cm x 81cm to 100cm x 100cm
  return 70; // > 100cm x 100cm
};

// Final price calculation using normalized logarithmic scaling
export const calculatePrice = (
  category: ArtistCategory,
  medium: string,
  width: number,
  height: number,
  k = 0.05
): number => {
  const [base, max] = CATEGORY_PRICE_RANGES[category];
  const mediumPoints = MEDIUM_POINTS[medium] || 0;
  const sizePoints = calculateSizePoints(width, height);
  const totalPoints = Math.min(mediumPoints + sizePoints, 100); // Cap at 100

  const normalizedLog = Math.log(k * totalPoints + 1) / Math.log(k * 100 + 1);

  const price = base + (max - base) * normalizedLog;

  return Math.round(price);
};
