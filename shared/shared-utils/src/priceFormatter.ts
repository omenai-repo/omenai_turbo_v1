import { currency_symbol } from "@omenai/shared-json/src/currencySymbol";

export function formatPrice(
  rawPrice: number | string,
  currency: string = "USD"
): string {
  const cleaned =
    typeof rawPrice === "string"
      ? parseFloat(rawPrice.replace(/^[^\d.-]+/, ""))
      : rawPrice;

  // Try to find the currency entry
  const match = currency_symbol.find(
    (entry) => entry.abbreviation === currency
  );

  // Use ISO currency formatting if possible
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency, // Use as-is; if invalid, it will throw
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(cleaned);
  } catch (e) {
    // Fallback for unsupported or custom currencies
    const symbol = match?.symbol ?? (currency || "$"); // Default to $ if no match found
    // Ensure we always show one decimal place
    return `${symbol}${cleaned.toFixed(1)}`;
  }
}
