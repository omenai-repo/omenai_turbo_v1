import { ArtistCategory } from "@omenai/shared-types";

// Category price ranges: [base, max]
const CATEGORY_PRICE_RANGES: Record<ArtistCategory, [number, number]> = {
  Emerging: [500, 2500],
  "Early Mid-Career": [1500, 5500],
  "Mid-Career": [2500, 7500],
  "Late Mid-Career": [3000, 9000],
  Established: [7000, 15000],
  Elite: [12000, 50000],
};

// Medium Point Allocation (Now Max 30)
const MEDIUM_POINTS: Record<string, number> = {
  Photography: 5,
  "Works on paper": 7,
  "Acrylic on canvas/linen/panel": 11,
  "Oil on canvas/panel": 13,
  "Mixed media on paper/canvas": 17,
  "Sculpture (Resin/plaster/clay)": 20,
  "Sculpture (Bronze/stone/metal)": 30,
};

// Size Points Calculation (Now Max 70)
const calculateSizePoints = (width: number, height: number): number => {
  const area = width * height; // cm²

  // Clamp area to 40,000 (max range you want to support)
  const clampedArea = Math.min(area, 40000);

  // Distribute area into 10 buckets (each bucket = 4000 cm²)
  const bucketSize = 4000;
  const pointsPerBucket = 7;

  // Calculate which bucket it falls into (0-based index)
  const bucketIndex = Math.floor(clampedArea / bucketSize);

  // Final score: (bucket index + 1) * points per bucket
  return (bucketIndex + 1) * pointsPerBucket;
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
