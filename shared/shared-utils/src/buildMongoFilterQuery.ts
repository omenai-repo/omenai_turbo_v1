interface FilterOptions {
  price: { min: number; max: number }[];
  year: { min: number; max: number }[];
  medium: string[];
  rarity: string[];
  // Add other filter categories and their types here
}

interface SelectedFilter {
  [key: string]: FilterOptions[keyof FilterOptions] | string[];
}

export function buildMongoQuery(selectedFilters: SelectedFilter): object {
  let query: { [key: string]: any } = {};

  let orConditions: any[] = [];

  for (const category in selectedFilters) {
    const selectedValues = selectedFilters[category];

    if (selectedValues.length > 0) {
      if (category === "year") {
        orConditions.push(
          ...selectedValues.map((range: any) => ({
            year: { $gte: range.min, $lte: range.max }, // Adjust field name if different
          }))
        );
      } else if (category === "price") {
        orConditions.push(
          ...selectedValues.map((range: any) => ({
            "pricing.usd_price": { $gte: range.min, $lte: range.max }, // Adjust field name if different
          }))
        );
      } else {
        // Handle other filter categories (e.g., medium)
        query[category] = { $in: selectedValues };
      }
    }
  }

  if (orConditions.length > 0) {
    query["$and"] = query["$and"] || [];
    query["$and"].push({ $or: orConditions });
  }

  return query;
}
