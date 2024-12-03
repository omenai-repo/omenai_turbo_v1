import { currency_symbol } from "@omenai/shared-json/src/currencySymbol.ts";
export function getCurrencySymbol(currency: string) {
  const found_currency = currency_symbol.find(
    (single_currency) => single_currency.abbreviation === currency.toUpperCase()
  );

  return found_currency?.symbol;
}
