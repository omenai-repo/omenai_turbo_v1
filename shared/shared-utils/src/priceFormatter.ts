const validCurrency = /^[A-Z]{3}$/;

export function formatPrice(price: number, currency: string = "USD"): string {
  const safeCurrency = validCurrency.test(currency) ? currency : "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(price);
}
