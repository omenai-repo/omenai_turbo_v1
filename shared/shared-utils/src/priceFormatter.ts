import { currency_symbol } from "@omenai/shared-json/src/currencySymbol";

export function formatPrice(
  rawPrice: number | string,
  currency: string = "USD"
): string {
  const cleaned =
    typeof rawPrice === "string"
      ? Number.parseFloat(rawPrice.replace(/^[^\d.-]+/, ""))
      : rawPrice;

  if (isNaN(cleaned)) return "";

  // Convert to string to inspect decimals
  const decimalPart = cleaned.toString().split(".")[1];

  let processed = cleaned;

  if (decimalPart) {
    if (decimalPart.length === 1) {
      // keep as-is (e.g., 1137.5)
      processed = cleaned;
    } else if (decimalPart.length === 2) {
      // keep 2 decimals (e.g., 1137.04)
      processed = cleaned;
    } else {
      // more than 2 decimals → round to 1 decimal
      processed = Math.round(cleaned * 10) / 10;
    }
  }

  // Determine how many decimals to show
  const finalDecimal =
    processed % 1 === 0
      ? 0
      : processed.toString().split(".")[1]?.length || 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: finalDecimal,
      maximumFractionDigits: finalDecimal,
    }).format(processed);
  } catch {
    const match = currency_symbol.find(
      (entry) => entry.abbreviation === currency
    );

    const symbol = match?.symbol ?? currency ?? "$";

    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: finalDecimal,
      maximumFractionDigits: finalDecimal,
    }).format(processed);

    return `${symbol}${formattedNumber}`;
  }
}