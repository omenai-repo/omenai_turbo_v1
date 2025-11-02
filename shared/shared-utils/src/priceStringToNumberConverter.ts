export function convertPriceStringToNumber(priceString: string): number {
  // Remove any currency symbol (e.g., $)
  const priceWithoutSymbol = priceString.replaceAll(/^\$/, "");

  // replaceAll all commas with empty strings (remove thousands separators)
  const priceWithoutCommas = priceWithoutSymbol.replaceAll(/,/g, "");

  // Parse the remaining string into a number and return it
  const priceNumber = Number.parseFloat(priceWithoutCommas);

  // Handle potential parsing errors (non-numeric characters)
  if (Number.isNaN(priceNumber)) {
    throw new Error("Invalid price format. Please enter a valid number.");
  }

  return priceNumber;
}
