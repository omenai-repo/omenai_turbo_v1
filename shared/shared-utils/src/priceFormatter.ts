export function formatPrice(price: number, currency?: string): string {
  const priceNumber = Number(price);
  const new_price = Number(priceNumber.toFixed(1));
  if (currency) {
    return `${currency}${new_price.toLocaleString()}`;
  } else {
    return `$${new_price.toLocaleString()}`;
  }
}
