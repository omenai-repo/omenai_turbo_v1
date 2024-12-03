export type Filter = {
  price: {
    min: number;
    max: number;
  }[];
  year: {
    min: number;
    max: number;
  }[];
  medium: string[];
  rarity: string[];
};

export function isEmptyFilter(filters: Filter): boolean {
  // Utilize Object.entries for iterating over key-value pairs
  for (const [label, filterArray] of Object.entries(filters)) {
    // Check if the filter array itself is not empty using Object.keys
    if (Object.keys(filterArray).length > 0) {
      return false; // Non-empty filter found, exit the loop
    }
  }

  // If the loop iterates without finding non-empty filters, return true
  return true;
}

// Helper function to handle complex filter value types (optional)
function isEmpty(value: unknown): boolean {
  // If the value is an array, check if it's empty
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // If the value is an object, check if it has no enumerable own properties
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }

  // For other types (strings, numbers, etc.), consider them empty if they are falsy
  return !value;
}
