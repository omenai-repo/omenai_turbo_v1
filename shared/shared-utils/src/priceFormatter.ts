const validCurrency = /^[A-Z]{3}$/;

export function formatPrice(
  rawPrice: number | string,
  currency: string = "USD"
): string {
  const safeCurrency = validCurrency.test(currency) ? currency : "USD";

  // Remove leading currency symbols and whitespace, then parse to float
  const cleaned =
    typeof rawPrice === "string"
      ? parseFloat(rawPrice.replace(/^[^\d.-]+/, ""))
      : rawPrice;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(cleaned);
}
