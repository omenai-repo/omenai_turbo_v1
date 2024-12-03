export function convertPriceStringToNumber(priceString: string): number {
  // Remove any currency symbol (e.g., $)
  const priceWithoutSymbol = priceString.replace(/^\$/, "");

  // Replace all commas with empty strings (remove thousands separators)
  const priceWithoutCommas = priceWithoutSymbol.replace(/,/g, "");

  // Parse the remaining string into a number and return it
  const priceNumber = parseFloat(priceWithoutCommas);

  // Handle potential parsing errors (non-numeric characters)
  if (isNaN(priceNumber)) {
    throw new Error("Invalid price format. Please enter a valid number.");
  }

  return priceNumber;
}
