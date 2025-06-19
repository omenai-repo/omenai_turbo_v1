interface ArtworkPricing {
  recommendedPrice: number;
  priceRange: [number, number, number, number, number];
  meanPrice: number;
}

type ArtistCategory =
  | "Emerging"
  | "Early Mid-Career"
  | "Mid-Career"
  | "Late Mid-Career"
  | "Established"
  | "Elite";

type ArtworkMedium =
  | "Photography"
  | "Works on paper"
  | "Acrylic on canvas/linen/panel"
  | "Oil on canvas/panel"
  | "Mixed media on paper/canvas"
  | "Sculpture (Resin/plaster/clay)"
  | "Sculpture (Bronze/stone/metal)";

interface ArtworkDetails {
  artistCategory: ArtistCategory;
  medium: ArtworkMedium;
  height: number; // in cm
  width: number; // in cm
}

function calculateArtworkPrice(artwork: ArtworkDetails): ArtworkPricing {
  // Base price ranges by artist category
  const categoryRanges: Record<ArtistCategory, [number, number]> = {
    Emerging: [500, 2500],
    "Early Mid-Career": [1000, 5000],
    "Mid-Career": [2000, 8500],
    "Late Mid-Career": [3000, 9000],
    Established: [7000, 15000],
    Elite: [12000, 50000],
  };

  // Medium hierarchy converted to 0.0 to 1.0 scale
  const mediumFactors: Record<ArtworkMedium, number> = {
    Photography: 0.0,
    "Works on paper": 0.15,
    "Acrylic on canvas/linen/panel": 0.35,
    "Mixed media on paper/canvas": 0.5,
    "Oil on canvas/panel": 0.7,
    "Sculpture (Resin/plaster/clay)": 0.85,
    "Sculpture (Bronze/stone/metal)": 1.0,
  };

  const area = artwork.height * artwork.width;
  const maxDimension = Math.max(artwork.height, artwork.width);

  function getSizeFactor(): number {
    if (maxDimension <= 40 && area <= 1200) {
      return (area / 1200) * 0.3;
    }
    if (maxDimension <= 101 && area <= 7676) {
      const normalizedArea = (area - 1200) / (7676 - 1200);
      return 0.3 + normalizedArea * 0.4;
    }
    const largeAreaStart = 7676;
    const veryLargeArea = 20000;
    const normalizedArea = Math.min(
      (area - largeAreaStart) / (veryLargeArea - largeAreaStart),
      1.0
    );
    return 0.7 + normalizedArea * 0.3;
  }

  const [baseMin, baseMax] = categoryRanges[artwork.artistCategory];
  const sizeFactor = getSizeFactor();
  const mediumFactor = mediumFactors[artwork.medium];

  // Weighted combination
  const totalWeight = 2.5 + 1.5;
  const combinedFactor = (sizeFactor * 2.5 + mediumFactor * 1.5) / totalWeight;

  // Calculate base price within the category range
  const priceRange = baseMax - baseMin;
  const basePrice = baseMin + priceRange * combinedFactor;
  const baseRounded = Math.round(basePrice);

  // Generate 5 price points with ±20% spread
  const spreadPercentage = 0.1;
  const totalSpread = spreadPercentage;
  const pricePoints: number[] = [];
  for (let i = 0; i < 5; i++) {
    const factor = -totalSpread + (i * (totalSpread * 2)) / 4;
    const pricePoint = Math.round(baseRounded * (1 + factor));
    const boundedPrice = Math.max(Math.min(pricePoint, baseMax), baseMin);
    pricePoints.push(boundedPrice);
  }

  // Remove duplicates and sort
  let uniquePrices = [...new Set(pricePoints)].sort((a, b) => a - b);

  // If fewer than 5 unique prices, fill in with evenly spaced points
  if (uniquePrices.length < 5) {
    const gap = (baseMax - baseMin) / 6;
    for (let i = 1; i <= 5 && uniquePrices.length < 5; i++) {
      const newPrice = Math.round(baseMin + gap * i);
      if (
        !uniquePrices.includes(newPrice) &&
        newPrice <= baseMax &&
        newPrice >= baseMin
      ) {
        uniquePrices.push(newPrice);
      }
    }
    uniquePrices = uniquePrices.sort((a, b) => a - b).slice(0, 5);
  } else {
    uniquePrices = uniquePrices.slice(0, 5);
  }

  const minPrice = uniquePrices[0];
  const maxPrice = uniquePrices[uniquePrices.length - 1];
  const meanPrice = Math.round((minPrice + maxPrice) / 2);
  const recommendedPrice =
    uniquePrices[3] ||
    uniquePrices[Math.floor(uniquePrices.length / 2) + 1] ||
    meanPrice;

  return {
    recommendedPrice,
    priceRange: uniquePrices as [number, number, number, number, number],
    meanPrice,
  };
}

// Helper function to get size category description
function getSizeCategory(height: number, width: number): string {
  const area = height * width;
  const maxDim = Math.max(height, width);
  if (maxDim <= 40 && area <= 1200) return "Small";
  if (maxDim <= 101 && area <= 7676) return "Medium";
  return "Large";
}

export {
  calculateArtworkPrice,
  getSizeCategory,
  type ArtworkPricing,
  type ArtworkDetails,
  type ArtistCategory,
  type ArtworkMedium,
};
